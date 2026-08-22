import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput, InteractionManager, Animated, Image, Keyboard, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, useKeyboardHandler } from 'react-native-keyboard-controller';
import ReanimatedAnimated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect, useRef, useState } from 'react';
import { MarkdownIt } from 'react-native-markdown-display';
import TryAnotherLink from '../components/TryAnotherLink';
import UrgeToolSheet from '../components/UrgeToolSheet';
import { Colors, FontFamily, FontSize, Radii, Shadows } from '@/constants/theme';
import { streamChatMessage } from '@/components/ChatAPI';
import { pickAnotherUrgeScreen, getUrgeScreenRoute, markUrgeMethodVisited } from '@/constants/urgeScreenOptions';
import { parseStyledWords, reconcileStyledWords } from '@/components/streamingMarkdown';

const CURRENT_KEY = 'coach';

const formatTime = (date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

function TypingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - delay),
        ])
      );

    const anims = [bounce(dot1, 0), bounce(dot2, 150), bounce(dot3, 300)];
    anims.forEach((anim) => anim.start());
    return () => anims.forEach((anim) => anim.stop());
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

export default function UrgeCoach() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [switchVisible, setSwitchVisible] = useState(false);
  const streamStateRef = useRef(null);
  const lastUserMessageIdRef = useRef(null);
  const viewportHeightRef = useRef(0);
  const spacerHeight = useSharedValue(0);
  const spacerStyle = useAnimatedStyle(() => ({ height: spacerHeight.value }));

  useEffect(() => {
    if (sending) spacerHeight.value = viewportHeightRef.current;
  }, [sending]);

  useKeyboardHandler(
    {
      onStart: (e) => {
        'worklet';
        runOnJS(setKeyboardVisible)(e.progress === 1);
        if (e.progress === 1) {
          spacerHeight.value = withTiming(0, { duration: e.duration });
        }
      },
    },
    [],
  );

  useEffect(() => {
    markUrgeMethodVisited(CURRENT_KEY);
  }, []);

  useEffect(() => {
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

  const handleSend = (overrideText) => {
    const text = (overrideText ?? inputText).trim();
    if (!text || sending) return;

    Keyboard.dismiss();
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
      setTimeout(pump, 40);
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
        if (!started) {
          const words = parseStyledWords(markdownItInstance, 'Something went wrong — try again.').map((word, index) => ({
            ...word,
            key: `err-${index}`,
            opacity: new Animated.Value(1),
          }));
          setMessages((prev) => [...prev, { id: `${Date.now()}-error`, sender: 'ai', words, time: formatTime(new Date()) }]);
        }
      },
    }).then((cancel) => {
      state.closeEs = cancel;
    });
  };

  function tryAnother() {
    const next = pickAnotherUrgeScreen(CURRENT_KEY);
    if (next) markUrgeMethodVisited(next.key);
    router.replace(next ? next.route : '/urge-surfing');
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backPill}>
          <Ionicons name="chevron-back" size={22} color={Colors.plum} />
        </TouchableOpacity>
        <TryAnotherLink onPress={tryAnother} onLongPress={() => setSwitchVisible(true)} />
        <View style={{ width: 40 }} />
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={messages.length === 0 ? styles.emptyContent : styles.chatContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          onLayout={(e) => { viewportHeightRef.current = e.nativeEvent.layout.height; }}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Image source={require('../../assets/images/bingebuddy3.png')} style={styles.emptyIconWrap} resizeMode="cover" />
              <Text style={styles.emptyGreeting}>Let&apos;s get through this together.</Text>
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
                      if (message.id === lastUserMessageIdRef.current) {
                        scrollViewRef.current?.scrollTo({ y: e.nativeEvent.layout.y, animated: true });
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
      </KeyboardAvoidingView>

      <UrgeToolSheet
        visible={switchVisible}
        onClose={() => setSwitchVisible(false)}
        onSelect={(key) => {
          setSwitchVisible(false);
          markUrgeMethodVisited(key);
          router.replace(getUrgeScreenRoute(key));
        }}
        title="Switch Tools"
        subtitle="Pick a different way to work through this moment."
        excludeKey={CURRENT_KEY}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.bg,
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

const markdownItInstance = MarkdownIt({ typographer: true, breaks: true });

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
