import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "@/context/AuthContext";
import TabBar from '../components/TabBar';
import SOSButton from '../components/SOSButton';
import { Colors, FontFamily, FontSize, Radii, Shadows } from '@/constants/theme';

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
            <Ionicons name="person" size={28} color={Colors.plum} />
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
            <View style={[styles.menuIconWrap, { backgroundColor: Colors.plumTint }]}>
              <Ionicons name="person-outline" size={20} color={Colors.plum} />
            </View>
            <Text style={styles.menuLabel}>Profile Settings</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.inkFaint} style={styles.menuChevron} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/privacy-security')}>
            <View style={[styles.menuIconWrap, { backgroundColor: Colors.sageTint }]}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.sage} />
            </View>
            <Text style={styles.menuLabel}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.inkFaint} style={styles.menuChevron} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/personalization')}>
            <View style={[styles.menuIconWrap, { backgroundColor: Colors.plumTint }]}>
              <Ionicons name="color-palette-outline" size={20} color={Colors.plum} />
            </View>
            <Text style={styles.menuLabel}>Personalization</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.inkFaint} style={styles.menuChevron} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/audio-recording')}>
            <View style={[styles.menuIconWrap, { backgroundColor: Colors.alertTint }]}>
              <Ionicons name="mic-outline" size={20} color={Colors.alert} />
            </View>
            <Text style={styles.menuLabel}>Add / Update Audio Recording</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.inkFaint} style={styles.menuChevron} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={Colors.alert} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Bottom spacer */}
        <View style={{ height: 90 }} />
      </ScrollView>

      <SOSButton />
      <TabBar activeTab="settings" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.hTitle,
    color: Colors.ink,
  },

  /* Profile Card */
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: Radii.card,
    padding: 16,
    marginBottom: 24,
    ...Shadows.soft,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.cardTitle,
    color: Colors.ink,
  },
  profileSub: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
    marginTop: 2,
  },

  /* Section Label */
  sectionLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginBottom: 8,
  },

  /* Menu Card */
  menuCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: Radii.card,
    marginBottom: 24,
    overflow: 'hidden',
    ...Shadows.soft,
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
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
  },
  menuChevron: {
    marginLeft: 4,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.bg,
    marginLeft: 66,
  },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: Radii.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    gap: 12,
    ...Shadows.soft,
  },
  logoutText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.bodyMd,
    color: Colors.alert,
  },
});
