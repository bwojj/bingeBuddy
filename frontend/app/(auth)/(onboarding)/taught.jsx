import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { coachingStyle } from '../../../components/OnboardingApi';

const OPTIONS = [
  {
    id: "gentle",
    title: "Gentle & Supportive",
    subtitle: "Encouraging words and a soft touch for when things get tough.",
    icon: (color) => <Ionicons name="heart-outline" size={22} color={color} />,
  },
  {
    id: "firm",
    title: "Firm & Direct",
    subtitle: "Honest feedback and clear accountability to keep you on track.",
    icon: (color) => <Ionicons name="shield-outline" size={22} color={color} />,
  },
  {
    id: "analytical",
    title: "Analytical",
    subtitle: "Deep insights and data-driven milestones to understand your progress.",
    icon: (color) => <MaterialCommunityIcons name="chart-line-variant" size={22} color={color} />,
  },
];

export default function Taught() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selected, setSelected] = useState('gentle');

  const handleCoachingStyle = async () => {
    const ok = await coachingStyle(selected);
    if(ok === true){
      router.push('/(auth)/(onboarding)/motivation')
    }
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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.stepText}>Step 3 of 5</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>

      {/* Title */}
      <Text style={styles.title}>How do you like to be taught?</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Choose the communication style that best supports your recovery journey.
      </Text>

      {/* Options */}
      {OPTIONS.map((option) => {
        const isSelected = selected === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            onPress={() => setSelected(option.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
              {option.icon(isSelected ? "#7B1FA2" : "#888")}
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                {option.title}
              </Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={22} color="#7B1FA2" />
            )}
          </TouchableOpacity>
        );
      })}

      {/* Continue button */}
      <TouchableOpacity style={styles.continueButton} onPress={handleCoachingStyle}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>

      {/* Footer note */}
      <Text style={styles.footerNote}>You can change this anytime in Settings.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    paddingHorizontal: 24,
  },

  /* Top row */
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7B1FA2",
    letterSpacing: 0.5,
  },

  /* Progress bar */
  progressTrack: {
    height: 4,
    backgroundColor: "#e8d5f5",
    borderRadius: 2,
    marginBottom: 32,
  },
  progressFill: {
    height: 4,
    width: "60%",
    backgroundColor: "#7B1FA2",
    borderRadius: 2,
  },

  /* Title */
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 12,
    lineHeight: 34,
  },

  /* Subtitle */
  subtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 28,
  },

  /* Option cards */
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "white",
    gap: 14,
  },
  optionCardSelected: {
    borderColor: "#7B1FA2",
    backgroundColor: "#F8F2FF",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleSelected: {
    backgroundColor: "#EDE0FA",
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: "#7B1FA2",
  },
  optionSubtitle: {
    fontSize: 13,
    color: "#888",
    lineHeight: 18,
  },

  /* Continue button */
  continueButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#7B1FA2",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  /* Footer */
  footerNote: {
    textAlign: "center",
    fontSize: 12,
    color: "#AAA",
  },
});
