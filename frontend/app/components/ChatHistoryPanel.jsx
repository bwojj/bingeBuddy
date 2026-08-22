import { Text, View, StyleSheet, TouchableOpacity, Modal, Pressable, Animated, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Radii, Shadows } from '@/constants/theme';
import { getChatSessions } from '@/components/ChatAPI';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PANEL_WIDTH = SCREEN_WIDTH * 0.5;

const formatSessionDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

function usePanelAnimation(visible) {
  const translateX = useRef(new Animated.Value(-PANEL_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 14,
      }).start();
    } else {
      translateX.setValue(-PANEL_WIDTH);
    }
  }, [visible, translateX]);

  const animateClosed = (onDone) => {
    Animated.timing(translateX, {
      toValue: -PANEL_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onDone?.();
    });
  };

  return [translateX, animateClosed];
}

// Left-side slide-in panel listing the user's ai coach chat sessions
export default function ChatHistoryPanel({ visible, onClose, onSelectSession, onNewChat, activeSessionId }) {
  const insets = useSafeAreaInsets();
  const [slide, animateClosed] = usePanelAnimation(visible);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    getChatSessions()
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Failed to load chat sessions', err);
        setSessions([]);
      })
      .finally(() => setLoading(false));
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.panel, { paddingTop: insets.top + 16, transform: [{ translateX: slide }] }]}>
          <TouchableOpacity style={styles.newChatRow} onPress={onNewChat} activeOpacity={0.75}>
            <View style={styles.newChatIconWrap}>
              <Ionicons name="add" size={18} color="white" />
            </View>
            <Text style={styles.newChatLabel}>New Chat</Text>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>History</Text>

          {loading ? (
            <ActivityIndicator style={styles.loading} color={Colors.plum} />
          ) : sessions.length === 0 ? (
            <Text style={styles.emptyText}>No previous conversations yet.</Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              {sessions.map((session) => {
                const active = session.session_id === activeSessionId;
                return (
                  <TouchableOpacity
                    key={session.session_id}
                    style={[styles.sessionRow, active && styles.sessionRowActive]}
                    onPress={() => {
                      onSelectSession(session);
                      animateClosed(onClose);
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.sessionTitle} numberOfLines={1}>
                      {session.session_title || formatSessionDate(session.created_at)}
                    </Text>
                    <Text style={styles.sessionDate}>{formatSessionDate(session.created_at)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </Animated.View>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(37,24,38,0.45)',
  },
  panel: {
    width: PANEL_WIDTH,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    ...Shadows.pop,
  },
  newChatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.plumTint,
    borderRadius: Radii.card,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  newChatIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatLabel: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.body,
    color: Colors.plumDeep,
  },
  sectionLabel: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondarySm,
    color: Colors.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  loading: {
    marginTop: 24,
  },
  emptyText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkFaint,
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  sessionRow: {
    borderRadius: Radii.card,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    backgroundColor: Colors.bg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  sessionRowActive: {
    backgroundColor: Colors.plumTint,
    borderColor: Colors.plum,
  },
  sessionTitle: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondary,
    color: Colors.ink,
    marginBottom: 3,
  },
  sessionDate: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
  },
});
