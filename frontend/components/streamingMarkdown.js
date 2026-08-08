// React Native can't independently animate nested <Text> — RN flattens
// nested text into a single native view with no separate node for the
// native driver to target. So instead of handing markdown off to a
// tree-based renderer (which nests <Text> for bold/italic/etc.), this
// flattens markdown-it's inline token stream into a sequence of "words",
// each tagged with whatever formatting currently applies to it. Every word
// then renders as its own flat, independently-animatable native view with
// the right style baked in directly — no nesting required.

const WORD_RE = /\S+\s*|\s+/g;

function pushWords(words, content, flags) {
  const pieces = content.match(WORD_RE);
  if (!pieces) return;
  for (const piece of pieces) {
    words.push({ text: piece, ...flags });
  }
}

function flagsFrom(bold, italic, code, link, quote) {
  return { bold: bold > 0, italic: italic > 0, code: code > 0, link: link > 0, quote: quote > 0 };
}

// markdown-it can't recognize "**bold**" as bold until the *closing* "**"
// has streamed in — until then it's genuinely just literal asterisks, which
// flashes on screen for a moment before the closer arrives and the whole
// span retroactively becomes bold. Optimistically appending a closer to a
// parse-only copy of the text (never to the stored rawText) means the
// instant an opening "**"/"__" streams in, everything after it renders bold
// right away instead of showing raw syntax first.
function closeUnterminatedMarkers(text) {
  let result = text;
  // Single backtick is ambiguous with a triple-backtick fence ("```") still
  // streaming in -- inserting a closer mid-fence would cut it into a bogus
  // inline code span instead. Skip it in that case; the flash is rare there
  // anyway since fenced blocks aren't one word, they arrive over many ticks.
  const markers = result.includes('```') ? ['**', '__'] : ['**', '__', '`'];
  for (const marker of markers) {
    const count = result.split(marker).length - 1;
    if (count % 2 === 1) {
      // CommonMark requires a closing delimiter to not be preceded by
      // whitespace ("right-flanking") — our reveal chunks always include
      // their trailing space (e.g. "...complete "), so appending the closer
      // at the very end would produce "complete **" and markdown-it would
      // correctly refuse to treat it as a valid closer. Insert it right
      // after the last non-whitespace character instead.
      const trimmed = result.replace(/\s+$/, '');
      const trailingWhitespace = result.slice(trimmed.length);
      result = trimmed + marker + trailingWhitespace;
    }
  }
  return result;
}

// Parses `text` as markdown and returns a flat list of
// { text, bold, italic, code, link, quote } word entries, plus layout-only
// { break: 'line' | 'paragraph' } and { hr: true } markers in place of block
// boundaries. Safe to call on a partial/incomplete markdown string (e.g. an
// unterminated "**") — markdown-it degrades unmatched syntax to literal text.
export function parseStyledWords(markdownIt, text) {
  const words = [];
  if (!text) return words;

  let bold = 0;
  let italic = 0;
  let code = 0;
  let link = 0;
  let quote = 0;
  const listStack = [];

  const walkInline = (children) => {
    if (!children) return;
    for (const token of children) {
      switch (token.type) {
        case 'text':
          pushWords(words, token.content, flagsFrom(bold, italic, code, link, quote));
          break;
        case 'code_inline':
          pushWords(words, token.content, flagsFrom(bold, italic, code + 1, link, quote));
          break;
        case 'strong_open':
          bold += 1;
          break;
        case 'strong_close':
          bold -= 1;
          break;
        case 'em_open':
          italic += 1;
          break;
        case 'em_close':
          italic -= 1;
          break;
        case 'link_open':
          link += 1;
          break;
        case 'link_close':
          link -= 1;
          break;
        case 'softbreak':
        case 'hardbreak':
          words.push({ break: 'line' });
          break;
        default:
          break;
      }
    }
  };

  const tokens = markdownIt.parse(closeUnterminatedMarkers(text), {});
  for (const token of tokens) {
    switch (token.type) {
      case 'inline':
        walkInline(token.children);
        break;
      case 'paragraph_close':
      case 'heading_close':
        words.push({ break: 'paragraph' });
        break;
      case 'blockquote_open':
        quote += 1;
        break;
      case 'blockquote_close':
        quote -= 1;
        words.push({ break: 'paragraph' });
        break;
      case 'bullet_list_open':
        listStack.push({ ordered: false });
        break;
      case 'ordered_list_open':
        listStack.push({ ordered: true, counter: Number(token.attrGet?.('start')) || 1 });
        break;
      case 'bullet_list_close':
      case 'ordered_list_close':
        listStack.pop();
        words.push({ break: 'paragraph' });
        break;
      case 'list_item_open': {
        const list = listStack[listStack.length - 1];
        if (list?.ordered) {
          words.push({ text: `${list.counter}. `, ...flagsFrom(bold, italic, code, link, quote) });
          list.counter += 1;
        } else {
          words.push({ text: '• ', ...flagsFrom(bold, italic, code, link, quote) });
        }
        break;
      }
      case 'list_item_close':
        words.push({ break: 'line' });
        break;
      case 'fence':
      case 'code_block':
        pushWords(words, token.content, flagsFrom(bold, italic, code + 1, link, quote));
        words.push({ break: 'paragraph' });
        break;
      case 'hr':
        words.push({ hr: true });
        words.push({ break: 'paragraph' });
        break;
      default:
        break;
    }
  }

  return words;
}

// Merges a freshly re-parsed word list against the previously rendered one
// so already-visible words keep their existing Animated.Value (and whatever
// fade progress/completion it has) instead of restarting every time more
// text streams in — only genuinely new words (or ones whose text changed,
// e.g. a word that was mid-stream and just got completed) get a fresh
// opacity value via `makeOpacity()`, which the caller should animate in.
export function reconcileStyledWords(prevWords, nextWords, makeOpacity) {
  return nextWords.map((word, index) => {
    const prev = prevWords[index];
    const key = `w-${index}`;
    if (word.break || word.hr) {
      return { ...word, key };
    }
    if (prev && !prev.break && !prev.hr) {
      if (prev.text === word.text) {
        return { ...prev, key, bold: word.bold, italic: word.italic, code: word.code, link: word.link, quote: word.quote };
      }
      // LLM streaming splits words mid-token constantly (e.g. "under" then
      // "understand" then "understanding" as separate deltas), so the word
      // at this slot keeps growing across ticks rather than actually being a
      // new word. Reuse the same opacity/animation state instead of handing
      // back a fresh one -- otherwise an already-visible word re-flashes
      // (fades in from 0 again) on every growth step, which is what reads as
      // flicker/twitch/erratic pacing.
      if (word.text.startsWith(prev.text) || prev.text.startsWith(word.text)) {
        return { ...word, key, opacity: prev.opacity };
      }
    }
    return { ...word, key, opacity: makeOpacity() };
  });
}
