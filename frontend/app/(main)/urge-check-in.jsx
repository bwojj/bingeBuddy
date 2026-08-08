import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';
import { URGE_SCREEN_OPTIONS, resetUrgeSession, markUrgeMethodVisited } from '@/constants/urgeScreenOptions';

// First stop after tapping "Feeling an urge?" on the home screen — a quick
// check-in before diving into tools, since "I already lost control" needs a
// very different (self-compassion, not problem-solving) response than
// "I'm having an urge right now".
export default function UrgeCheckIn() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userPreferences } = useAuth();

  const defaultOption = URGE_SCREEN_OPTIONS.find((opt) => opt.key === userPreferences?.default_urge_screen);

  function startUrgeFlow() {
    resetUrgeSession();
    if (defaultOption) markUrgeMethodVisited(defaultOption.key);
    router.push(defaultOption?.route ?? '/panic');
  }

  return (
    <LinearGradient
      colors={Gradients.hero.colors}
      start={Gradients.hero.start}
      end={Gradients.hero.end}
      style={styles.container}
    >
      <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { top: insets.top + 10 }]}>
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.middle}>
        <Image source={require('../../assets/images/bingebuddy3.png')} style={styles.logo} resizeMode="cover" />
        <Text style={styles.title}>Where are you at right now?</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={startUrgeFlow} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>I&apos;m Having an Urge</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/lost-control')} activeOpacity={0.75}>
          <Text style={styles.secondaryBtnText}>I Lost Control</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: insets.bottom + 24 }} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 26,
    marginBottom: 28,
    ...Shadows.pop,
  },
  title: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.flowTitle,
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 44,
  },
  primaryBtn: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: Radii.btn,
    paddingVertical: 18,
    marginBottom: 14,
    ...Shadows.pop,
  },
  primaryBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
    color: Colors.plum,
  },
  secondaryBtn: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: Radii.btn,
    paddingVertical: 18,
  },
  secondaryBtnText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.body,
    color: 'white',
  },
});
