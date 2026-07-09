import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import TabBar from '../components/TabBar';
import SOSButton from '../components/SOSButton';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';
import { sendChatMessage } from '@/components/ChatAPI';

const formatTime = (date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export default function Coach() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollViewRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (overrideText) => {
    const text = (overrideText ?? inputText).trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { id: `${Date.now()}-user`, sender: 'user', text, time: formatTime(new Date()) }]);
    setInputText('');
    setSending(true);

    const result = await sendChatMessage(text);
    setSending(false);

    if (result?.success && result.reply) {
      setMessages((prev) => [...prev, { id: `${Date.now()}-ai`, sender: 'ai', text: result.reply, time: formatTime(new Date()) }]);
    } else {
      setMessages((prev) => [...prev, { id: `${Date.now()}-error`, sender: 'ai', text: 'Something went wrong — try again.', time: formatTime(new Date()) }]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={Colors.plum} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <LinearGradient
            colors={Gradients.logo.colors}
            start={Gradients.logo.start}
            end={Gradients.logo.end}
            style={styles.avatarCircle}
          >
            <MaterialCommunityIcons name="robot" size={22} color="white" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>AI Coach</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>ONLINE TO SUPPORT YOU</Text>
            </View>
          </View>
        </View>
        <Ionicons name="ellipsis-horizontal" size={22} color={Colors.ink} />
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {/* Today divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>TODAY</Text>
          <View style={styles.dividerLine} />
        </View>

        {messages.map((message) =>
          message.sender === 'ai' ? (
            <View key={message.id} style={styles.aiMessageRow}>
              <View style={styles.aiAvatar}>
                <View style={styles.aiAvatarDot} />
              </View>
              <View style={styles.aiMessageWrapper}>
                <View style={styles.aiBubble}>
                  <Text style={styles.aiBubbleText}>{message.text}</Text>
                </View>
                <Text style={styles.messageTime}>{message.time}</Text>
              </View>
            </View>
          ) : (
            <View key={message.id} style={styles.userMessageRow}>
              <View style={styles.userMessageWrapper}>
                <View style={styles.userBubble}>
                  <Text style={styles.userBubbleText}>{message.text}</Text>
                </View>
                <Text style={styles.messageTimeRight}>{message.time}</Text>
              </View>
            </View>
          )
        )}

        {sending && (
          <View style={styles.aiMessageRow}>
            <View style={styles.aiAvatar}>
              <View style={styles.aiAvatarDot} />
            </View>
            <View style={styles.aiMessageWrapper}>
              <View style={styles.aiBubble}>
                <Text style={styles.aiBubbleText}>{'···'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick reply chips */}
        <View style={styles.chipsRow}>
          <TouchableOpacity style={styles.chip} onPress={() => handleSend("I'm feeling an urge")}>
            <Text style={styles.chipText}>{"I'm feeling an urge"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => handleSend('I need a distraction')}>
            <Text style={styles.chipText}>I need a distraction</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom || 10 }]}>
        <View style={styles.plusButton}>
          <Ionicons name="add" size={24} color={Colors.plum} />
        </View>
        <View style={styles.inputField}>
          <TextInput
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

      <SOSButton />
      <TabBar activeTab="coach" />
    </KeyboardAvoidingView>
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
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.cardTitle,
    color: Colors.ink,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#4CAF50',
  },
  onlineText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: 9,
    color: Colors.inkFaint,
    letterSpacing: 0.5,
  },

  /* Chat */
  chatContent: {
    padding: 16,
    paddingBottom: 10,
  },

  /* Divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.line,
  },
  dividerText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
    marginHorizontal: 12,
    letterSpacing: 1,
  },

  /* AI Messages */
  aiMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  aiAvatarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  aiMessageWrapper: {
    maxWidth: '75%',
  },
  aiBubble: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderBottomLeftRadius: 5,
    padding: 14,
    ...Shadows.soft,
  },
  aiBubbleText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
    lineHeight: 20,
  },
  messageTime: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
    marginTop: 4,
    marginLeft: 4,
  },

  /* User Messages */
  userMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  userMessageWrapper: {
    maxWidth: '75%',
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

  /* Quick Reply Chips */
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 10,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: Colors.plum,
    borderRadius: Radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.plumTint2,
  },
  chipText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.secondarySm,
    color: Colors.plum,
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
  plusButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
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
