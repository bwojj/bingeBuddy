import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput, InteractionManager, Animated, Image, Keyboard, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { KeyboardAvoidingView, useKeyboardHandler } from 'react-native-keyboard-controller';
import ReanimatedAnimated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect, useRef, useState } from 'react';
import { MarkdownIt } from 'react-native-markdown-display';
import { usePostHog } from 'posthog-react-native';
import TabBar from '../components/TabBar';
import ChatHistoryPanel from '../components/ChatHistoryPanel';
import { useAuth } from '@/context/AuthContext';
import { Colors, FontFamily, FontSize, Radii, Shadows } from '@/constants/theme';
import { streamChatMessage, getSessionMessages } from '@/components/ChatAPI';
import { parseStyledWords, reconcileStyledWords } from '@/components/streamingMarkdown';

const formatTime = (date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

// Shown in the empty state -- one is picked at random each time the screen
// mounts so the greeting doesn't feel static across visits.
const EMPTY_STATE_GREETINGS = [
  'How can I help you today?',
  "What's on your mind right now?",
  "Hey, I'm here. What would you like to talk through?",
  'How are you feeling today?',
  'What can I support you with?',
  "I'm here whenever you're ready. What's up?",
  "Good to see you. How's today going?",
  "What's coming up for you right now?",
  "Let's talk. Where should we start?",
  "I'm listening. What's on your mind?",
  'What would feel helpful right now?',
  'Checking in — how are you doing?',
  "Whatever you're facing, I'm here for it.",
  "What's happening for you today?",
  'Take a breath. What would you like to work through?',
  "I'm glad you're here. What can I help with?",
  'How can I support you right now?',
  "Where's your head at today?",
  "No judgment here. What's going on?",
  'Ready when you are. What would you like to talk about?',
];

// How much further the blur/fade zone extends below the button row itself —
// gives the mask room to ease the blur out gradually instead of the content
// switching from fully-blurred to fully-sharp in a single frame at the row's
// own edge (which reads as a hard visible line).
const HEADER_FADE_TAIL = 32;

function TypingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // A single dot's up-down bounce -- staggering (not looping) is handled
    // one level up so all three dots share one animation clock instead of
    // three independent Animated.loop()s that have no guaranteed shared
    // phase and can drift into looking synchronized with each other.
    const bounce = (dot) =>
      Animated.sequence([
        Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]);

    const loop = Animated.loop(
      Animated.sequence([
        Animated.stagger(150, [bounce(dot1), bounce(dot2), bounce(dot3)]),
        Animated.delay(300),
      ])
    );
    // On the very first message, this mounts mid-transition from the empty
    // state to the message list -- the busiest the JS thread gets on this
    // screen. Animated.stagger's delayed starts are scheduled via JS timers,
    // so if that thread is congested right as they're due, dot2/dot3's
    // starts (150ms/300ms out) can bunch together while dot1 (0ms, starts
    // synchronously) doesn't. Deferring until the thread is idle avoids it.
    const task = InteractionManager.runAfterInteractions(() => loop.start());
    return () => {
      task.cancel();
      loop.stop();
    };
  }, []);

  return (
    <View style={styles.typingRow}>
      <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]} />
    </View>
  );
}

function AnimatedWord({ word }) {
  if (word.break) {
    return <View style={word.break === 'paragraph' ? styles.aiParagraphBreak : styles.aiLineBreak} />;
  }
  if (word.hr) {
    return <View style={styles.aiHr} />;
  }
  // Nesting Animated.Text inside a parent Text gets flattened into a single
  // native text view (no independent node for the native driver to animate),
  // so each word needs its own real native view to actually fade.
  return (
    <Animated.View style={{ opacity: word.opacity }}>
      <Text
        style={[
          wordStyles.base,
          word.bold && wordStyles.bold,
          word.italic && wordStyles.italic,
          word.quote && wordStyles.quote,
          word.code && wordStyles.code,
          word.link && wordStyles.link,
        ]}
      >
        {word.text}
      </Text>
    </Animated.View>
  );
}

export default function Coach() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userPreferences, userLoading } = useAuth();
  const posthog = usePostHog();
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);

  // Defense-in-depth against direct deep links bypassing TabBar's
  // subscription check (see TabBar.jsx's handlePress). Gated on userLoading
  // so this doesn't fire a false redirect while AuthContext's initial fetch
  // is still in flight.
  useEffect(() => {
    if (userLoading) return;
    if (!userPreferences?.is_premium) {
      router.replace('/paywall');
    }
  }, [userLoading, userPreferences]);

  const [emptyGreeting] = useState(
    () => EMPTY_STATE_GREETINGS[Math.floor(Math.random() * EMPTY_STATE_GREETINGS.length)]
  );
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [chatError, setChatError] = useState(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [tabBarHeight, setTabBarHeight] = useState(70 + (insets.bottom || 10));
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(insets.top + 62);
  const streamStateRef = useRef(null);
  const lastUserMessageIdRef = useRef(null);
  const viewportHeightRef = useRef(0);
  // Reserves room below the latest exchange for the AI reply to stream into
  // (see the trailing spacer in the message list below). Opens instantly on
  // send and, unlike an earlier version of this, deliberately never closes
  // on its own once the reply finishes -- collapsing it right then read as
  // the whitespace "snapping" shut. Instead it's collapsed in the keyboard
  // handler below, timed to the keyboard's own rise so the two motions read
  // as one and the user is never left able to scroll down into dead space.
  const spacerHeight = useSharedValue(0);
  const spacerStyle = useAnimatedStyle(() => ({ height: spacerHeight.value }));

  useEffect(() => {
    if (sending) spacerHeight.value = viewportHeightRef.current;
  }, [sending]);

  // `onStart` fires the instant the keyboard begins moving (same native event
  // that drives KeyboardAvoidingView's padding), so the tab-bar spacer
  // collapses/expands in lockstep with the animation rather than lagging
  // until it fully finishes (which is what `useKeyboardState().isVisible` does).
  useKeyboardHandler(
    {
      onStart: (e) => {
        'worklet';
        runOnJS(setKeyboardVisible)(e.progress === 1);
        // Keyboard rising (not dismissing) is the moment the user's about to
        // scroll/interact again -- close the reserved reply space then,
        // timed to the keyboard's own animation duration so it's absorbed
        // into that motion instead of being its own separate, visible jump.
        if (e.progress === 1) {
          spacerHeight.value = withTiming(0, { duration: e.duration });
        }
      },
    },
    [],
  );

  useEffect(() => {
    // Wait for the screen's own push-in transition (and any other pending
    // interactions) to finish before opening the keyboard — focusing too early
    // makes the keyboard finish rising while the screen is still sliding in,
    // which reads as the input bar "popping" into place afterward.
    const task = InteractionManager.runAfterInteractions(() => {
      inputRef.current?.focus();
    });
    return () => task.cancel();
  }, []);

  useEffect(() => {
    return () => {
      if (streamStateRef.current) {
        streamStateRef.current.cancelled = true;
        streamStateRef.current.closeEs?.();
      }
    };
  }, []);

  const cancelActiveStream = () => {
    if (streamStateRef.current) {
      streamStateRef.current.cancelled = true;
      streamStateRef.current.closeEs?.();
      streamStateRef.current = null;
    }
    setSending(false);
    setAwaitingReply(false);
  };

  const handleNewChat = () => {
    setHistoryVisible(false);
    cancelActiveStream();
    setSessionId(null);
    setMessages([]);
    setChatError(null);
    Keyboard.dismiss();
  };

  const handleSelectSession = async (session) => {
    // Panel closes itself (see ChatHistoryPanel's onSelectSession handler) —
    // this fires immediately so the new session starts loading while the
    // panel is still sliding shut, instead of waiting for it to fully close.
    cancelActiveStream();
    Keyboard.dismiss();
    setSessionId(session.session_id);
    setMessages([]);
    setChatError(null);
    setLoadingHistory(true);
    try {
      const history = await getSessionMessages(session.session_id);
      const loaded = (Array.isArray(history) ? history : []).map((msg, index) => {
        const time = formatTime(new Date(msg.timestamp));
        if (msg.sender === 'human') {
          return { id: `h-${index}`, sender: 'user', text: msg.text, time };
        }
        const words = parseStyledWords(markdownItInstance, msg.text).map((word, wIndex) => ({
          ...word,
          key: `h-${index}-${wIndex}`,
          opacity: new Animated.Value(1),
        }));
        return { id: `h-${index}`, sender: 'ai', words, time };
      });
      setMessages(loaded);
      // No reserved trailing space for a loaded (non-streaming) session, so
      // this naturally lands right at the last real message — no dead space
      // to scroll past it, and the preceding message stays visible above it.
      requestAnimationFrame(() => scrollViewRef.current?.scrollToEnd({ animated: false }));
    } catch (err) {
      console.error('Failed to load session messages', err);
      setMessages([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = (overrideText) => {
    const text = (overrideText ?? inputText).trim();
    if (!text || sending) return;

    posthog?.capture('ai_coach_message_sent');
    Keyboard.dismiss();
    setChatError(null);
    const userMessageId = `${Date.now()}-user`;
    lastUserMessageIdRef.current = userMessageId;
    setMessages((prev) => [...prev, { id: userMessageId, sender: 'user', text, time: formatTime(new Date()) }]);
    setInputText('');
    setSending(true);
    setAwaitingReply(true);

    const aiMessageId = `${Date.now()}-ai`;
    let started = false;
    let doneReceived = false;
    let pendingSessionId = null;
    let pumping = false;
    let rawText = '';
    let currentWords = [];
    const queue = [];

    // Gemini's stream() only yields a handful of large, bursty chunks (not
    // token-by-token), so we re-chunk each incoming piece into words and
    // drip them in one at a time. Each raw chunk gets appended to rawText,
    // then re-parsed as markdown and flattened into styled word fragments
    // (see streamingMarkdown.js) — reconcileStyledWords reuses each word's
    // existing Animated.Value when its text hasn't changed, so only the
    // newly revealed word(s) fade in on each tick. currentWords (not React
    // state) is the source of truth for the diff, and animations are kicked
    // off outside setMessages — state updater functions aren't guaranteed to
    // run exactly once synchronously (StrictMode double-invokes them in dev),
    // so side effects like starting an animation can't safely live inside one.
    const state = { cancelled: false, closeEs: null };
    streamStateRef.current = state;

    const pump = () => {
      if (state.cancelled) return;
      if (queue.length === 0) {
        pumping = false;
        if (doneReceived) {
          setSending(false);
          if (pendingSessionId) setSessionId(pendingSessionId);
        }
        return;
      }
      pumping = true;
      rawText += queue.shift();
      const parsed = parseStyledWords(markdownItInstance, rawText);
      const newlyCreated = [];
      currentWords = reconcileStyledWords(currentWords, parsed, () => {
        const opacity = new Animated.Value(0);
        newlyCreated.push(opacity);
        return opacity;
      });
      const wordsForMessage = currentWords;
      setMessages((prev) => prev.map((m) => (m.id === aiMessageId ? { ...m, words: wordsForMessage } : m)));
      newlyCreated.forEach((opacity) => {
        Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
      });
      // Adaptive cadence instead of a fixed 40ms/word: gemini-3.1-flash-lite's
      // chunks land with much less even spacing than 2.5's did, so a fixed
      // rate either outruns the network (queue hits 0, reveal freezes mid-
      // sentence until the next chunk lands) or lags behind it. Draining
      // faster while a backlog exists and slower as it thins keeps a small
      // buffer in reserve, absorbing gaps between chunks instead of
      // stalling on them. Range is centered on the original 40ms/word pace
      // (a ~14-word backlog lands right around there) rather than the
      // previous 18ms floor, which read as too fast once bursts were large.
      const delay = Math.max(30, Math.min(75, 1350 / (queue.length + 18)));
      setTimeout(pump, delay);
    };

    streamChatMessage(text, sessionId, {
      onToken: (token) => {
        if (!started) {
          started = true;
          setAwaitingReply(false);
          setMessages((prev) => [...prev, { id: aiMessageId, sender: 'ai', words: [], time: formatTime(new Date()) }]);
        }
        queue.push(...(token.match(/\S+\s*|\s+/g) || [token]));
        if (!pumping) pump();
      },
      onDone: (newSessionId) => {
        doneReceived = true;
        pendingSessionId = newSessionId;
        if (!pumping) {
          setSending(false);
          if (newSessionId) setSessionId(newSessionId);
        }
      },
      onError: () => {
        setSending(false);
        setAwaitingReply(false);
        // Covers every failure mode the backend can hand back for this turn --
        // our own rate limiting (DRF throttle, HTTP 429), the retriever not
        // being ready (HTTP 503), and the LLM call itself failing mid-stream
        // (e.g. the model's own rate limit or an upstream outage). All of
        // them are equally "try again shortly" from the user's perspective,
        // so they share one error state rather than being distinguished.
        setChatError({ retryText: text });
        // Unlike a successful reply, there's no streamed content coming to
        // fill this space -- leaving it open (per the spacerHeight comment
        // above) would let the user scroll down into a full screen of dead
        // space below the short error card.
        spacerHeight.value = withTiming(0, { duration: 200 });
      },
    }).then((cancel) => {
      state.closeEs = cancel;
    });
  };

  const handleRetry = () => {
    const retryText = chatError?.retryText;
    setChatError(null);
    if (retryText) handleSend(retryText);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avoider}>
        {/* Chat Messages — full-bleed behind the header so it's visible,
            blurred, through the glass as it scrolls underneath. */}
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={[
              loadingHistory || messages.length === 0 ? styles.emptyContent : styles.chatContent,
              { paddingTop: headerHeight },
            ]}
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
            onLayout={(e) => { viewportHeightRef.current = e.nativeEvent.layout.height; }}
          >
            {loadingHistory ? (
              <ActivityIndicator color={Colors.plum} size="large" />
            ) : messages.length === 0 ? (
              <View style={styles.emptyState}>
                <Image source={require('../../assets/images/bingebuddy3.png')} style={styles.emptyIconWrap} resizeMode="cover" />
                <Text style={styles.emptyGreeting}>{emptyGreeting}</Text>
              </View>
            ) : (
              <>
                {messages.map((message) =>
                  message.sender === 'ai' ? (
                    <View key={message.id} style={styles.aiMessageRow}>
                      <View style={styles.aiMessageWrapper}>
                        <View style={styles.aiBubble}>
                          <View style={styles.aiWordWrap}>
                            {message.words.map((word) => <AnimatedWord key={word.key} word={word} />)}
                          </View>
                        </View>
                        <Text style={styles.messageTime}>{message.time}</Text>
                      </View>
                    </View>
                  ) : (
                    <View
                      key={message.id}
                      style={styles.userMessageRow}
                      onLayout={(e) => {
                        // Pins the just-sent message just below the floating
                        // header's blur/fade zone (not screen y=0 — the header
                        // overlays the top of the screen regardless of scroll
                        // position, so scrolling to the message's raw layout y
                        // would tuck it directly under the blur), leaving the
                        // spacer below as room for the AI reply to fill in as
                        // it streams — matches how ChatGPT's mobile app
                        // scrolls on send.
                        if (message.id === lastUserMessageIdRef.current) {
                          const y = Math.max(0, e.nativeEvent.layout.y - (headerHeight + HEADER_FADE_TAIL));
                          scrollViewRef.current?.scrollTo({ y, animated: true });
                        }
                      }}
                    >
                      <View style={styles.userMessageWrapper}>
                        <View style={styles.userBubble}>
                          <Text style={styles.userBubbleText}>{message.text}</Text>
                        </View>
                        <Text style={styles.messageTimeRight}>{message.time}</Text>
                      </View>
                    </View>
                  )
                )}

                {awaitingReply && (
                  <View style={styles.aiMessageRow}>
                    <View style={styles.aiMessageWrapper}>
                      <View style={styles.aiBubble}>
                        <TypingDots />
                      </View>
                    </View>
                  </View>
                )}

                {chatError && (
                  <View style={styles.errorCard}>
                    <View style={styles.errorIconCircle}>
                      <Ionicons name="cloud-offline-outline" size={26} color={Colors.alert} />
                    </View>
                    <Text style={styles.errorTitle}>AI Coach is currently unavailable</Text>
                    <Text style={styles.errorBody}>
                      This is usually due to rate limits — please try again in a few hours.
                    </Text>
                    <TouchableOpacity style={styles.errorRetryButton} onPress={handleRetry} activeOpacity={0.8}>
                      <Text style={styles.errorRetryText}>Try Again</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Reserves room below the latest exchange for the AI reply to
                    fill in as it streams — matches ChatGPT's mobile app. See
                    the spacerHeight comment above for why it closes on the
                    keyboard rising rather than when the reply finishes. */}
                <ReanimatedAnimated.View style={spacerStyle} />
              </>
            )}
          </ScrollView>

          {/* Input bar */}
          <View
            style={[
              styles.inputBar,
              { paddingBottom: keyboardVisible ? 10 : (insets.bottom || 10) },
            ]}
          >
            <View style={styles.inputField}>
              <TextInput
                ref={inputRef}
                style={styles.inputText}
                placeholder="Type a message..."
                placeholderTextColor={Colors.inkFaint}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => handleSend()}
                returnKeyType="send"
                multiline
              />
            </View>
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || sending}
            >
              <Ionicons name="send" size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Reserves room for the tab bar below; collapses instantly so it never
              competes with the keyboard-avoiding view above. */}
          <View style={{ height: keyboardVisible ? 0 : tabBarHeight }} />
        </KeyboardAvoidingView>

        {/* Floating glass header — messages scroll underneath and blur
            through it, buttons stay crisp on top (matches Claude's app).
            The blur/mask zone runs taller than the button row itself so the
            fade-to-sharp happens gradually over the content below the
            buttons, instead of cutting off right at the row's own edge. */}
        <View style={[styles.headerBlurZone, { height: headerHeight + HEADER_FADE_TAIL }]} pointerEvents="box-none">
          <MaskedView
            style={StyleSheet.absoluteFillObject}
            maskElement={
              <LinearGradient
                colors={['white', 'white', 'transparent']}
                locations={[0, 0.15, 1]}
                style={{ flex: 1 }}
              />
            }
          >
            <BlurView
              intensity={65}
              tint="light"
              experimentalBlurMethod="dimezisBlurView"
              style={StyleSheet.absoluteFillObject}
            />
          </MaskedView>
          <View
            style={[styles.header, { paddingTop: insets.top + 10 }]}
            onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
          >
            <TouchableOpacity onPress={() => router.back()} style={styles.backPill}>
              <Ionicons name="chevron-back" size={22} color={Colors.plum} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                // iOS remembers whichever input was focused when the modal
                // was presented and hands focus back to it on dismissal --
                // blurring only on close fights that after the fact and
                // loses. Blur before it opens so there's nothing to restore.
                inputRef.current?.blur();
                Keyboard.dismiss();
                setHistoryVisible(true);
              }}
              style={[styles.backPill, styles.menuPill]}
            >
              <Ionicons name="menu" size={22} color={Colors.plum} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                // Same reasoning as the history panel: blur before leaving
                // so there's nothing for iOS to restore focus to when the
                // user comes back via the memory screen's back button.
                inputRef.current?.blur();
                Keyboard.dismiss();
                router.push('/manage-memory');
              }}
              style={[styles.backPill, styles.pfpPill]}
            >
              <Ionicons name="person-circle" size={26} color={Colors.plum} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {!keyboardVisible && (
        <View
          style={styles.tabBarOverlay}
          onLayout={(e) => setTabBarHeight(e.nativeEvent.layout.height)}
        >
          <TabBar activeTab="coach" />
        </View>
      )}

      <ChatHistoryPanel
        visible={historyVisible}
        onClose={() => {
          setHistoryVisible(false);
          // The input keeps native focus the whole time the panel is open
          // (the panel just visually covers it) -- Keyboard.dismiss() alone
          // hides the keyboard cosmetically but doesn't resign the input's
          // first responder status, so dismissing the modal hands focus
          // (and the keyboard) right back to it. Explicitly blur it too.
          inputRef.current?.blur();
          Keyboard.dismiss();
        }}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        activeSessionId={sessionId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  avoider: {
    flex: 1,
  },
  tabBarOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },

  /* Header */
  headerBlurZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  menuPill: {
    marginLeft: 8,
  },
  pfpPill: {
    marginLeft: 'auto',
  },
  backPill: {
    width: 40,
    height: 40,
    borderRadius: Radii.pill / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    ...Shadows.soft,
  },

  /* Chat */
  chatContent: {
    padding: 16,
    paddingBottom: 10,
  },

  /* Empty state */
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 20,
    ...Shadows.pop,
  },
  emptyGreeting: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.hTitle,
    color: Colors.ink,
    textAlign: 'center',
  },

  /* AI Messages */
  aiMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  aiMessageWrapper: {
    maxWidth: '88%',
  },
  aiBubble: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderBottomLeftRadius: 5,
    padding: 14,
    ...Shadows.soft,
  },
  aiWordWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  aiLineBreak: {
    width: '100%',
    height: 0,
  },
  aiParagraphBreak: {
    width: '100%',
    height: 8,
  },
  aiHr: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.line,
    marginVertical: 6,
  },
  messageTime: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
    marginTop: 4,
    marginLeft: 4,
  },

  /* AI Coach error state */
  errorCard: {
    alignItems: 'center',
    backgroundColor: Colors.alertTint,
    borderRadius: Radii.card,
    borderLeftWidth: 4,
    borderLeftColor: Colors.alert,
    padding: 20,
    marginBottom: 16,
    ...Shadows.soft,
  },
  errorIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  errorTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  errorBody: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.secondary,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  errorRetryButton: {
    height: 42,
    paddingHorizontal: 24,
    borderRadius: Radii.btn,
    backgroundColor: Colors.alert,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRetryText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.secondary,
    color: 'white',
  },

  /* Typing indicator */
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.inkFaint,
  },

  /* User Messages */
  userMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  userMessageWrapper: {
    maxWidth: '65%',
    alignItems: 'flex-end',
  },
  userBubble: {
    backgroundColor: Colors.plum,
    borderRadius: 16,
    borderBottomRightRadius: 5,
    padding: 14,
  },
  userBubbleText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.bodyMd,
    color: 'white',
    lineHeight: 20,
  },
  messageTimeRight: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
    marginTop: 4,
    marginRight: 4,
  },

  /* Input Bar */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    gap: 10,
  },
  inputField: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: Colors.plumTint2,
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
    maxHeight: 84,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

const monospace = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

// `breaks: true` makes a single newline render as a real line break instead
// of the CommonMark default of collapsing it into a space — the AI's replies
// rely on single newlines for line breaks, not the "two spaces" hard-break.
const markdownItInstance = MarkdownIt({ typographer: true, breaks: true });

// Per-word styles for AnimatedWord — each word is a flat, independent Text
// leaf (not nested inside another styled Text), so formatting is just a
// style prop on that word rather than something requiring nested markup.
const wordStyles = StyleSheet.create({
  base: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
    lineHeight: 20,
  },
  bold: {
    fontFamily: FontFamily.sansBold,
  },
  italic: {
    fontStyle: 'italic',
  },
  quote: {
    fontStyle: 'italic',
    color: Colors.inkSoft,
  },
  code: {
    fontFamily: monospace,
    fontSize: FontSize.secondary,
    backgroundColor: Colors.plumTint,
    color: Colors.plumDeep,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  link: {
    color: Colors.plum,
    textDecorationLine: 'underline',
  },
});
