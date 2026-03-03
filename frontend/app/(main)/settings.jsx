import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from "@/context/AuthContext";

export default function Settings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userCredentials, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const displayName = userCredentials?.first_name || userCredentials?.username || 'Your Profile';
  const displaySub = userCredentials?.email || '';

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

        {/* Profile Row — display only, not tappable */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={28} color="#7B1FA2" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileSub}>{displaySub}</Text>
          </View>
        </View>

        {/* ACCOUNT Section */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/profile-settings')}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#ede7f6' }]}>
              <Ionicons name="person-outline" size={20} color="#7B1FA2" />
            </View>
            <Text style={styles.menuLabel}>Profile Settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#bbb" style={styles.menuChevron} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/privacy-security')}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#e8f5e9' }]}>
              <Ionicons name="lock-closed-outline" size={20} color="#388E3C" />
            </View>
            <Text style={styles.menuLabel}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={18} color="#bbb" style={styles.menuChevron} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/personalization')}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="color-palette-outline" size={20} color="#7B1FA2" />
            </View>
            <Text style={styles.menuLabel}>Personalization</Text>
            <Ionicons name="chevron-forward" size={18} color="#bbb" style={styles.menuChevron} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#C62828" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

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

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#C62828',
  },
});
