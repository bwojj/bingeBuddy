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

// randomly picked each open
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


const HEADER_FADE_TAIL = 32;

function TypingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

    // since gemini releases large chunks
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
        setChatError({ retryText: text });
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

          <View style={{ height: keyboardVisible ? 0 : tabBarHeight }} />
        </KeyboardAvoidingView>

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
