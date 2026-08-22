import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { updateProfile } from '../../../components/DataAPI';
import { Colors, FontFamily, FontSize, Radii } from '../../../constants/theme';


export default function OnboardingName() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleNext = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    const result = await updateProfile({ first_name: trimmed });
    setSubmitting(false);
    if (result?.success) {
      router.push('/(auth)/(onboarding)/maincause');
    } else {
      Alert.alert('Something went wrong', result?.error || "Couldn't save your name. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top row */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} color={Colors.ink} />
          </TouchableOpacity>
          <Text style={styles.stepText}>STEP 1 OF 4</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        {/* Centered body */}
        <View style={styles.centerBlock}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-outline" size={30} color={Colors.plum} />
          </View>

          <Text style={styles.title}>{"What should we call you?"}</Text>
          <Text style={styles.subtitle}>
            {"Your name from Google or Apple isn't shared with us automatically -- just tell us what you'd like to go by."}
          </Text>

          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={19} color={Colors.inkFaint} />
            <TextInput
              style={styles.input}
              placeholder="Alex"
              placeholderTextColor={Colors.inkFaint}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={handleNext}
              textContentType="nickname"
              autoComplete="name"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.nextButton, (!name.trim() || submitting) && { opacity: 0.6 }]}
          onPress={handleNext}
          disabled={!name.trim() || submitting}
        >
          {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.nextButtonText}>Continue</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    width: "25%",
    backgroundColor: Colors.plum,
    borderRadius: 3,
  },

  /* Centered content */
  centerBlock: {
    flex: 1,
    justifyContent: "center",
  },
  iconCircle: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.plumTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  /* Title */
  title: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.flowTitle,
    color: Colors.ink,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 40,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.body,
    color: Colors.inkSoft,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 28,
  },

  /* Input */
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: 13,
    paddingHorizontal: 14,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
    marginLeft: 10,
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
  },
  nextButtonText: {
    color: "white",
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
  },
});
