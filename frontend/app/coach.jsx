import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function Coach() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#7B1FA2" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.avatarCircle}>
            <MaterialCommunityIcons name="robot" size={22} color="white" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Coach</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>ONLINE TO SUPPORT YOU</Text>
            </View>
          </View>
        </View>
        <Ionicons name="ellipsis-horizontal" size={22} color="#333" />
      </View>

      {/* Chat Messages */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>TODAY</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* AI message 1 */}
        <View style={styles.aiMessageRow}>
          <View style={styles.aiAvatar}>
            <View style={styles.aiAvatarDot} />
          </View>
          <View style={styles.aiMessageWrapper}>
            <View style={styles.aiBubble}>
              <Text style={styles.aiBubbleText}>
                {"Good morning, Alex! I'm here for you today. How are you feeling right now?"}
              </Text>
            </View>
            <Text style={styles.messageTime}>9:41 AM</Text>
          </View>
        </View>

        {/* User message */}
        <View style={styles.userMessageRow}>
          <View style={styles.userMessageWrapper}>
            <View style={styles.userBubble}>
              <Text style={styles.userBubbleText}>
                {"I'm feeling a bit restless. The urges are starting to crawl in."}
              </Text>
            </View>
            <Text style={styles.messageTimeRight}>9:42 AM</Text>
          </View>
        </View>

        {/* AI message 2 */}
        <View style={styles.aiMessageRow}>
          <View style={styles.aiAvatar}>
            <View style={styles.aiAvatarDot} />
          </View>
          <View style={styles.aiMessageWrapper}>
            <View style={styles.aiBubble}>
              <Text style={styles.aiBubbleText}>
                {"I understand. That restlessness is just a wave\u2014it will pass. Let's try to ground ourselves. Would you like to try a 2-minute breathing exercise or should we find a distraction?"}
              </Text>
            </View>
            <Text style={styles.messageTime}>9:43 AM</Text>
          </View>
        </View>

        {/* Quick reply chips */}
        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{"I'm feeling an urge"}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>I need a distraction</Text>
          </View>
        </View>
      </ScrollView>

      {/* Input bar */}
      <View style={styles.inputBar}>
        <View style={styles.plusButton}>
          <Ionicons name="add" size={24} color="#7B1FA2" />
        </View>
        <View style={styles.inputField}>
          <Text style={styles.inputPlaceholder}>Type a message...</Text>
        </View>
        <View style={styles.sendButton}>
          <Ionicons name="send" size={18} color="white" />
        </View>
      </View>

      {/* SOS Button */}
      <View style={styles.sosButton}>
        <MaterialCommunityIcons name="lifebuoy" size={26} color="white" />
        <Text style={styles.sosText}>SOS</Text>
      </View>

      {/* Bottom Tab Bar */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom || 10 }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/')}>
          <Ionicons name="home-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/progress')}>
          <Ionicons name="bar-chart-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>Progress</Text>
        </TouchableOpacity>
        <View style={styles.tabItem}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#7B1FA2" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>AI Coach</Text>
        </View>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/journal')}>
          <Ionicons name="document-text-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>Journal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3edf7',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    backgroundColor: '#7B1FA2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
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
    fontSize: 9,
    fontWeight: '600',
    color: '#999',
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
    backgroundColor: '#ddd',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
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
    backgroundColor: '#7B1FA2',
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
    backgroundColor: 'white',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  aiBubbleText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    color: '#aaa',
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
    backgroundColor: '#7B1FA2',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 14,
  },
  userBubbleText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  messageTimeRight: {
    fontSize: 11,
    color: '#aaa',
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
    borderColor: '#7B1FA2',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    color: '#7B1FA2',
    fontWeight: '500',
  },

  /* Input Bar */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10,
  },
  plusButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f0e6f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputField: {
    flex: 1,
    height: 40,
    backgroundColor: '#f5f0fa',
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  inputPlaceholder: {
    fontSize: 14,
    color: '#aaa',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#7B1FA2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* SOS Button */
  sosButton: {
    position: 'absolute',
    right: 10,
    bottom: 95,
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#C62828',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  sosText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 1,
  },

  /* Bottom Tab Bar */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#7B1FA2',
  },
});
