import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import VerifyEmailForm from '../../components/VerifyEmailForm';
import { Colors, FontFamily, FontSize } from '../../../constants/theme';

// Shown right after signup, before the rest of onboarding -- intentionally
// not numbered as one of the "STEP X OF 4" screens since it's skippable and
// not part of the required onboarding path (soft gate, not a hard block).
export default function OnboardingVerifyEmail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const proceed = () => router.push('/(auth)/(onboarding)/maincause');

  // Normally just pops back to signup.jsx's still-mounted "edit email" mode.
  // But this screen can also be landed on directly (e.g. the root layout's
  // onboarding-incomplete redirect after an app refresh), which leaves no
  // history to pop -- back() would then throw "GO_BACK not handled by any
  // navigator". Falls back to a fresh navigation to signup in that case;
  // signup.jsx reads the editEmail param to still land in the right mode.
  const editEmail = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/signup?editEmail=1');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 30 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="mail-outline" size={40} color={Colors.plum} />
      </View>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>
        We just sent a 6-digit code to your email. Enter it below to confirm your account.
      </Text>

      <VerifyEmailForm onVerified={proceed} />

      <TouchableOpacity onPress={editEmail} style={styles.linkRow}>
        <Text style={styles.linkText}>Sent to the wrong address? Edit it</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={proceed}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.hTitle,
    color: Colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.bodyMd,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  linkRow: {
    marginTop: 24,
  },
  linkText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondary,
    color: Colors.plum,
  },
  skipText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.secondary,
    color: Colors.inkFaint,
    marginTop: 18,
  },
});
