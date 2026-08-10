import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { addMemory } from "@/components/ChatAPI";
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';

export default function ManageMemory() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userPreferences, refreshUserData } = useAuth();

  const existing = userPreferences?.ai_memory ?? {};
  const hasExisting = !!(existing.Goals || existing.Causes || existing.Additional);

  const [goals, setGoals] = useState(existing.Goals ?? '');
  const [causes, setCauses] = useState(existing.Causes ?? '');
  const [additional, setAdditional] = useState(existing.Additional ?? '');
  const [editing, setEditing] = useState(!hasExisting);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!goals.trim()) {
      Alert.alert('Goals Required', 'Please share your main life goals.');
      return;
    }
    if (!causes.trim()) {
      Alert.alert('Causes Required', 'Please share your main causes of binge eating.');
      return;
    }
    if (!additional.trim()) {
      Alert.alert('More Info Required', 'Please add anything else worth knowing.');
      return;
    }

    setSaving(true);
    const result = await addMemory({ memory: goals, causes, text: additional });
    setSaving(false);

    if (result?.ok && result?.success) {
      await refreshUserData();
      setEditing(false);
      Alert.alert('Saved', "Your coach will remember this going forward.");
    } else {
      Alert.alert('Error', result?.error ?? 'Failed to save your memory. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {/* Header */}
        <LinearGradient
          colors={Gradients.hero.colors}
          start={Gradients.hero.start}
          end={Gradients.hero.end}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Memory</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        {/* Intro */}
        <Text style={styles.intro}>
          Set up your coach&apos;s memory. Share your main goals, what usually triggers your binges,
          and anything else worth knowing. Your coach remembers all of it across every conversation,
          so the more specific you are, the more personal your coaching gets.
        </Text>

        {/* Main Life Goals */}
        <Text style={styles.sectionLabel}>MAIN LIFE GOALS</Text>
        <View style={styles.card}>
          <TextInput
            style={[styles.input, styles.inputMultiline, !editing && styles.inputReadOnly]}
            value={goals}
            onChangeText={setGoals}
            editable={editing}
            multiline
            numberOfLines={2}
            placeholder="What are you working toward?"
            placeholderTextColor={Colors.inkFaint}
          />
        </View>

        {/* Main Causes */}
        <Text style={styles.sectionLabel}>MAIN CAUSES OF BINGE EATING</Text>
        <View style={styles.card}>
          <TextInput
            style={[styles.input, styles.inputMultiline, !editing && styles.inputReadOnly]}
            value={causes}
            onChangeText={setCauses}
            editable={editing}
            multiline
            numberOfLines={2}
            placeholder="What usually triggers an urge for you?"
            placeholderTextColor={Colors.inkFaint}
          />
        </View>

        {/* Anything Else */}
        <Text style={styles.sectionLabel}>ANYTHING ELSE</Text>
        <View style={styles.tipBox}>
          <Ionicons name="bulb-outline" size={16} color={Colors.plum} style={{ marginTop: 1 }} />
          <Text style={styles.tipText}>
            Tip: ask your current favorite AI chatbot for a rundown of the memory it has on you —
            drop that in here too.
          </Text>
        </View>
        <View style={styles.card}>
          <TextInput
            style={[styles.input, styles.inputLarge, !editing && styles.inputReadOnly]}
            value={additional}
            onChangeText={setAdditional}
            editable={editing}
            multiline
            numberOfLines={6}
            placeholder="Anything else worth your coach knowing..."
            placeholderTextColor={Colors.inkFaint}
          />
        </View>

        {/* Action Button */}
        {editing ? (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            {saving
              ? <ActivityIndicator color="white" />
              : <Text style={styles.saveBtnText}>Save Changes</Text>
            }
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)} activeOpacity={0.85}>
            <Ionicons name="pencil-outline" size={16} color={Colors.plum} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.plumDeep,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: Colors.bg,
    paddingBottom: 20,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.topbarTitle,
    color: 'white',
  },

  /* Intro */
  intro: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondary,
    color: Colors.inkSoft,
    lineHeight: 19,
    marginHorizontal: 20,
    marginBottom: 16,
  },

  /* Section Label */
  sectionLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginBottom: 6,
  },

  /* Tip box */
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.plumTint2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.plumSoft,
    borderRadius: Radii.card,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  tipText: {
    flex: 1,
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
    lineHeight: 18,
  },

  /* Card */
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: Radii.card,
    padding: 14,
    marginBottom: 14,
    ...Shadows.soft,
  },
  input: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.body,
    color: Colors.ink,
    textAlignVertical: 'top',
  },
  inputMultiline: {
    minHeight: 48,
  },
  inputLarge: {
    minHeight: 160,
  },
  inputReadOnly: {
    color: Colors.inkFaint,
  },

  /* Save Button */
  saveBtn: {
    backgroundColor: Colors.plum,
    marginHorizontal: 20,
    borderRadius: Radii.btn,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadows.pop,
  },
  saveBtnText: {
    color: 'white',
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
  },

  /* Edit Button */
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: Radii.btn,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: Colors.plum,
  },
  editBtnText: {
    color: Colors.plum,
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
  },
});
