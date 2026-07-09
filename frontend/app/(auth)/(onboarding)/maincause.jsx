import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { mainCause } from '../../../components/OnboardingApi';
import { Colors, FontFamily, FontSize, Radii } from '../../../constants/theme';

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
          <Ionicons name="chevron-back" size={26} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.stepText}>STEP 2 OF 3</Text>
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
              {option.icon(isSelected ? Colors.plum : Colors.inkSoft)}
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                {option.title}
              </Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            {isSelected && <Ionicons name="checkmark-circle" size={22} color={Colors.plum} />}
          </TouchableOpacity>
        );
      })}

      {/* Next button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleMainCause}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

      {/* Not sure link */}
      <TouchableOpacity onPress={() => router.push('/(auth)/(onboarding)/motivation')}>
        <Text style={styles.notSureText}>{"I'm not sure yet"}</Text>
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
  },

  /* Top row */
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  stepText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.plumSoft,
    letterSpacing: 1.5,
  },

  /* Progress bar */
  progressTrack: {
    height: 5,
    backgroundColor: Colors.line,
    borderRadius: 3,
    marginBottom: 32,
  },
  progressFill: {
    height: 5,
    width: "66%",
    backgroundColor: Colors.plum,
    borderRadius: 3,
  },

  /* Title */
  title: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.flowTitle,
    color: Colors.ink,
    marginBottom: 12,
    lineHeight: 40,
    letterSpacing: -0.4,
  },
  titleHighlight: {
    color: Colors.plum,
  },

  /* Subtitle */
  subtitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.body,
    color: Colors.inkSoft,
    lineHeight: 22,
    marginBottom: 28,
  },

  /* Option cards */
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: 15,
    padding: 14,
    marginBottom: 11,
    backgroundColor: Colors.surface,
    gap: 13,
  },
  optionCardSelected: {
    borderColor: Colors.plum,
    backgroundColor: Colors.plumTint2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#F1EFF2",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleSelected: {
    backgroundColor: Colors.plumTint,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
    marginBottom: 3,
  },
  optionTitleSelected: {
    color: Colors.plum,
  },
  optionSubtitle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.eyebrow,
    color: Colors.inkSoft,
    lineHeight: 18,
  },

  /* Next button */
  nextButton: {
    width: "100%",
    height: 52,
    backgroundColor: Colors.plum,
    borderRadius: Radii.btn,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 18,
  },
  nextButtonText: {
    color: "white",
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
  },

  /* Not sure */
  notSureText: {
    textAlign: "center",
    color: Colors.plum,
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.bodyMd,
  },
});
