import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from '@/context/AuthContext';
import { markAiCoachIntroSeen } from '@/components/DataAPI';
import { Colors, FontFamily, FontSize, Radii, Shadows } from '@/constants/theme';

// One-time intro shown the first time a user taps the AI Coach tab (see
// TabBar.jsx, which checks userPreferences.seen_ai_coach_intro before
// routing here vs. straight to /coach). Styled to match recovery-intro.jsx's
// walkthrough screens, but as a single page with one CTA rather than a
// multi-step flow. Closing without continuing leaves the flag unset, so the
// intro simply shows again next time the tab is tapped.
export default function AiCoachIntro() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { refreshUserData } = useAuth();
  const [entering, setEntering] = useState(false);

  async function handleStart() {
    setEntering(true);
    await markAiCoachIntroSeen();
    await refreshUserData();
    router.replace('/coach');
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={{ width: 26 }} />
        <Text style={styles.eyebrow}>AI COACH</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={Colors.ink} />
        </TouchableOpacity>
      </View>

      {/* Centered body */}
      <View style={styles.centerBlock}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <Ionicons name="chatbubble-ellipses" size={30} color={Colors.plum} />
          </View>
        </View>

        <Text style={styles.title}>Your Coach, Anytime</Text>

        <Text style={styles.body}>
          You never have to face an urge alone again. Your coach is here around the clock, ready the second your head gets loud or a craving hits hard. Tell it what you&apos;re going through and it&apos;ll help you work through it right then, whether you&apos;re fighting an urge, sitting with a slip you feel bad about, or trying to untangle a thought you can&apos;t shake. It draws on real binge eating recovery, not generic wellness tips, so it understands this specific struggle and knows how to actually help. Whenever you need to talk, it&apos;s right here.
        </Text>
      </View>

      {/* Start button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleStart} disabled={entering}>
        <Text style={styles.nextButtonText}>{entering ? 'Entering…' : 'Start Chatting'}</Text>
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
    flexGrow: 1,
  },

  /* Top row */
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  eyebrow: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.plumSoft,
    letterSpacing: 1.5,
  },

  /* Centered content block */
  centerBlock: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 12,
  },

  /* Icon */
  iconWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.plumTint,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Title */
  title: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.flowTitle,
    color: Colors.ink,
    textAlign: "center",
    marginBottom: 14,
    lineHeight: 40,
    letterSpacing: -0.4,
  },

  /* Body */
  body: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.body,
    color: Colors.inkSoft,
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 24,
  },

  /* Start button */
  nextButton: {
    width: "100%",
    height: 52,
    backgroundColor: Colors.plum,
    borderRadius: Radii.btn,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.pop,
  },
  nextButtonText: {
    color: "white",
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
  },
});
