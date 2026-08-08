import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from "@/context/AuthContext";
import { rateAppManually } from "@/lib/reviewPrompt";
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';

export default function Settings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logout, userPreferences } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Gradients.hero.colors}
        start={Gradients.hero.start}
        end={Gradients.hero.end}
        style={[styles.topbar, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Settings</Text>
        <View style={styles.backBtn} />
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ACCOUNT Section */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.menuCard}>
          {userPreferences?.email_verified === false && (
            <>
              <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/verify-email')}>
                <View style={[styles.menuIconWrap, { backgroundColor: Colors.amberTint }]}>
                  <Ionicons name="mail-unread-outline" size={20} color={Colors.amber} />
                </View>
                <Text style={styles.menuLabel}>Verify Email</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.inkFaint} style={styles.menuChevron} />
              </TouchableOpacity>

              <View style={styles.menuDivider} />
            </>
          )}

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

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow} onPress={rateAppManually}>
            <View style={[styles.menuIconWrap, { backgroundColor: Colors.sageTint }]}>
              <Ionicons name="star-outline" size={20} color={Colors.sage} />
            </View>
            <Text style={styles.menuLabel}>Rate the App</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.inkFaint} style={styles.menuChevron} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={Colors.alert} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Bottom spacer */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  topbarTitle: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.topbarTitle,
    color: 'white',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
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
