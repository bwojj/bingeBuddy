import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

export default function Settings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [sosAccess, setSosAccess] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={[styles.titleContainer, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Row */}
        <TouchableOpacity style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={28} color="#7B1FA2" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Alex Johnson</Text>
            <Text style={styles.profileSub}>Day 3 of Recovery</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#bbb" />
        </TouchableOpacity>

        {/* ACCOUNT Section */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#ede7f6' }]}>
              <Ionicons name="person-outline" size={20} color="#7B1FA2" />
            </View>
            <Text style={styles.menuLabel}>Profile Settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#bbb" style={styles.menuChevron} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#fff3e0' }]}>
              <Ionicons name="notifications-outline" size={20} color="#F57C00" />
            </View>
            <Text style={styles.menuLabel}>Notification Preferences</Text>
            <Ionicons name="chevron-forward" size={18} color="#bbb" style={styles.menuChevron} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#e8f5e9' }]}>
              <Ionicons name="lock-closed-outline" size={20} color="#388E3C" />
            </View>
            <Text style={styles.menuLabel}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={18} color="#bbb" style={styles.menuChevron} />
          </TouchableOpacity>
        </View>

        {/* PREFERENCES Section */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.menuCard}>
          <View style={styles.menuRow}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#ede7f6' }]}>
              <Ionicons name="moon-outline" size={20} color="#7B1FA2" />
            </View>
            <Text style={styles.menuLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#ddd', true: '#7B1FA2' }}
              thumbColor="white"
              style={styles.toggle}
            />
          </View>

          <View style={styles.menuDivider} />

          <View style={styles.menuRow}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#fce4ec' }]}>
              <MaterialCommunityIcons name="lifebuoy" size={20} color="#C62828" />
            </View>
            <Text style={styles.menuLabel}>SOS Quick Access</Text>
            <Switch
              value={sosAccess}
              onValueChange={setSosAccess}
              trackColor={{ false: '#ddd', true: '#7B1FA2' }}
              thumbColor="white"
              style={styles.toggle}
            />
          </View>

          <View style={styles.menuDivider} />

          <View style={styles.menuRow}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#e8f5e9' }]}>
              <Ionicons name="notifications-circle-outline" size={20} color="#388E3C" />
            </View>
            <Text style={styles.menuLabel}>Daily Reminders</Text>
            <Switch
              value={dailyReminders}
              onValueChange={setDailyReminders}
              trackColor={{ false: '#ddd', true: '#7B1FA2' }}
              thumbColor="white"
              style={styles.toggle}
            />
          </View>
        </View>

        {/* Bottom spacer */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* SOS Button */}
      <TouchableOpacity style={styles.sosButton} onPress={() => router.push('/panic')}>
        <MaterialCommunityIcons name="lifebuoy" size={26} color="white" />
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>

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
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/coach')}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>AI Coach</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/journal')}>
          <Ionicons name="document-text-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>Journal</Text>
        </TouchableOpacity>
        <View style={styles.tabItem}>
          <Ionicons name="settings" size={24} color="#7B1FA2" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Settings</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3edf7',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },

  /* Profile Card */
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ede7f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  profileSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },

  /* Section Label */
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginBottom: 8,
  },

  /* Menu Card */
  menuCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '400',
  },
  menuChevron: {
    marginLeft: 4,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f3edf7',
    marginLeft: 66,
  },
  toggle: {
    marginLeft: 8,
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
