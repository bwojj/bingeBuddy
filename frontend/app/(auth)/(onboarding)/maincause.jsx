import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { mainCause } from '../../../components/OnboardingApi';

const INITIAL_OPTIONS = [
  {
    id: "stress",
    title: "Stress",
    subtitle: "Feeling overwhelmed by work or life",
    icon: (color) => <MaterialCommunityIcons name="lightning-bolt" size={22} color={color} />,
  },
  {
    id: "boredom",
    title: "Boredom",
    subtitle: "Eating when there is nothing to do",
    icon: (color) => <Ionicons name="time-outline" size={22} color={color} />,
  },
  {
    id: "emotions",
    title: "Difficult Emotions",
    subtitle: "Coping with sadness or anxiety",
    icon: (color) => <MaterialCommunityIcons name="emoticon-sad-outline" size={22} color={color} />,
  },
  {
    id: "social",
    title: "Social Situations",
    subtitle: "Pressure from friends or family events",
    icon: (color) => <Ionicons name="people-outline" size={22} color={color} />,
  },
];

export default function MainCause() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selected, setSelected] = useState('stress');

  const handleMainCause = async () => {
    const ok = await mainCause(selected); 
    if(ok === true){
      router.push('/(auth)/(onboarding)/taught')
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
        <Text style={styles.stepText}>STEP 2 OF 5</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>

      {/* Title */}
      <Text style={styles.title}>
        {"What is your main cause of "}
        <Text style={styles.titleHighlight}>binge eating?</Text>
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Identifying your triggers is the first step toward a healthier relationship with food.
      </Text>

      {/* Options */}
      {INITIAL_OPTIONS.map((option) => {
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
            {isSelected && <Ionicons name="checkmark-circle" size={22} color="#7B1FA2" />}
          </TouchableOpacity>
        );
      })}

      {/* Next button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleMainCause}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

      {/* Not sure link */}
      <TouchableOpacity onPress={() => router.push('/(auth)/(onboarding)/taught')}>
        <Text style={styles.notSureText}>{"I'm not sure yet"}</Text>
      </TouchableOpacity>
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
    letterSpacing: 1,
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
    width: "40%",
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
  titleHighlight: {
    color: "#7B1FA2",
  },

  /* Subtitle */
  subtitle: {
    fontSize: 14,
    color: "#7B1FA2",
    lineHeight: 22,
    marginBottom: 28,
    textAlign: "center",
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
    marginBottom: 3,
  },
  optionTitleSelected: {
    color: "#7B1FA2",
  },
  optionSubtitle: {
    fontSize: 13,
    color: "#888",
    lineHeight: 18,
  },

  /* Next button */
  nextButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#7B1FA2",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 18,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  /* Not sure */
  notSureText: {
    textAlign: "center",
    color: "#7B1FA2",
    fontSize: 14,
    fontWeight: "500",
  },
});
