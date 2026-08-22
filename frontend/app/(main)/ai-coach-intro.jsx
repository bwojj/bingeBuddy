import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from '@/context/AuthContext';
import { markAiCoachIntroSeen } from '@/components/DataAPI';
import { Colors, FontFamily, FontSize, Radii, Shadows } from '@/constants/theme';


export default function AiCoachIntro() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { refreshUserData } = useAuth();
  const [entering, setEntering] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  async function handleStart() {
    if (!consentChecked) return;
    setEntering(true);
    await markAiCoachIntroSeen(true);
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

        {/* AI-generated content disclosure */}
        <View style={styles.disclosureCard}>
          <View style={styles.disclosureHeader}>
            <Ionicons name="sparkles" size={15} color={Colors.plum} />
            <Text style={styles.disclosureLabel}>AI-GENERATED</Text>
          </View>
          <Text style={styles.disclosureText}>
            Every reply in this chat is written by an AI model, not a human therapist. It can be wrong or give advice that doesn&apos;t fit your situation, and it isn&apos;t a substitute for professional medical or mental health care. If you&apos;re in crisis, please contact a crisis line or emergency services.
          </Text>
        </View>

        {/* required before the first message can ever be sent */}
        <View style={styles.termsRow}>
          <TouchableOpacity
            style={[styles.checkbox, consentChecked && styles.checkboxChecked]}
            onPress={() => setConsentChecked((v) => !v)}
          >
            {consentChecked && <Ionicons name="checkmark" size={13} color="white" />}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I understand my messages, coaching style, and memory notes will be sent to Google&apos;s Gemini AI to generate responses, and I consent to that.
          </Text>
        </View>
      </View>

      {/* start button */}
      <TouchableOpacity
        style={[styles.nextButton, !consentChecked && styles.nextButtonDisabled]}
        onPress={handleStart}
        disabled={entering || !consentChecked}
      >
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
    marginBottom: 20,
  },

  /* AI-generated content disclosure */
  disclosureCard: {
    width: "100%",
    backgroundColor: Colors.plumTint2,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 14,
    marginBottom: 16,
  },
  disclosureHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  disclosureLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.plum,
    letterSpacing: 1,
  },
  disclosureText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
    lineHeight: 19,
  },

  /* Consent checkbox */
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkbox: {
    width: 21,
    height: 21,
    borderWidth: 1.6,
    borderColor: '#cabfce',
    borderRadius: 6,
    marginTop: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.plum,
    borderColor: Colors.plum,
  },
  termsText: {
    flex: 1,
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
    lineHeight: 19,
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
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: "white",
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
  },
});
