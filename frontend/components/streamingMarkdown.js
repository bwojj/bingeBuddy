
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

function closeUnterminatedMarkers(text) {
  let result = text;
  const markers = result.includes('```') ? ['**', '__'] : ['**', '__', '`'];
  for (const marker of markers) {
    const count = result.split(marker).length - 1;
    if (count % 2 === 1) {
      const trimmed = result.replace(/\s+$/, '');
      const trailingWhitespace = result.slice(trimmed.length);
      result = trimmed + marker + trailingWhitespace;
    }
  }
  return result;
}

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
      if (word.text.startsWith(prev.text) || prev.text.startsWith(word.text)) {
        return { ...word, key, opacity: prev.opacity };
      }
    }
    return { ...word, key, opacity: makeOpacity() };
  });
}
