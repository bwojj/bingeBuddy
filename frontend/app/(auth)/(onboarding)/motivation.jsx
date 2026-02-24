import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { motivation } from '../../../components/OnboardingApi';
import { useAuth } from '../../../context/AuthContext';

const INITIAL_CHIPS = [
  { id: "health", label: "Health" },
  { id: "weight", label: "Weight Loss" },
  { id: "confidence", label: "Confidence" },
  { id: "mental", label: "Mental Clarity" },
  { id: "money", label: "Save Money" },
  { id: "relationships", label: "Relationships" },
  { id: "sleep", label: "Sleep Quality" },
  { id: "career", label: "Career Goals" },
];

export default function Motivation() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setIsAuthenticated } = useAuth();
  const [selected, setSelected] = useState(new Set(['health']));

  const toggleChip = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleMotivation = async () => {
    const ok = await motivation(Array.from(selected));
    if(ok === true)
    {
      setIsAuthenticated(true);
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
        <Text style={styles.stepText}>STEP 3 OF 3</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={styles.progressMeta}>
          <Text style={styles.finalStepLabel}>FINAL STEP</Text>
          <Text style={styles.progressPercent}>100%</Text>
        </View>
        <View style={styles.progressFill} />
      </View>

      {/* Heart icon */}
      <View style={styles.iconWrapper}>
        <View style={styles.iconCircle}>
          <Ionicons name="heart-outline" size={32} color="#7B1FA2" />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Why do you want to stop?</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Select the motivations that matter most to you. This helps us personalize your recovery journey.
      </Text>

      {/* Chips grid */}
      <View style={styles.chipsGrid}>
        {INITIAL_CHIPS.map((chip) => {
          const isSelected = selected.has(chip.id);
          return (
            <TouchableOpacity
              key={chip.id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => toggleChip(chip.id)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <Ionicons name="shield-checkmark" size={14} color="white" style={{ marginRight: 5 }} />
              )}
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Other chip */}
        <TouchableOpacity style={styles.chipOther} onPress={() => {}}>
          <MaterialCommunityIcons name="plus" size={14} color="#7B1FA2" style={{ marginRight: 4 }} />
          <Text style={styles.chipOtherText}>Other</Text>
        </TouchableOpacity>
      </View>

      {/* Finish button */}
      <TouchableOpacity style={styles.finishButton} onPress={handleMotivation}>
        <Text style={styles.finishButtonText}>Finish</Text>
        <MaterialCommunityIcons name="check-bold" size={18} color="white" style={{ marginLeft: 8 }} />
      </TouchableOpacity>

      {/* Footer note */}
      <Text style={styles.footerNote}>You can always change these later in settings.</Text>
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
    color: "#555",
    letterSpacing: 1,
  },

  /* Progress bar */
  progressTrack: {
    marginBottom: 32,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  finalStepLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7B1FA2",
    letterSpacing: 0.5,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7B1FA2",
  },
  progressFill: {
    height: 4,
    width: "100%",
    backgroundColor: "#7B1FA2",
    borderRadius: 2,
  },

  /* Heart icon */
  iconWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Title */
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
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

  /* Chips */
  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 32,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
  },
  chipSelected: {
    backgroundColor: "#7B1FA2",
    borderColor: "#7B1FA2",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  chipTextSelected: {
    color: "white",
  },
  chipOther: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "#C084FC",
    borderStyle: "dashed",
    backgroundColor: "white",
  },
  chipOtherText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7B1FA2",
  },

  /* Finish button */
  finishButton: {
    flexDirection: "row",
    width: "100%",
    height: 52,
    backgroundColor: "#7B1FA2",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  finishButtonText: {
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
