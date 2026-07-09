import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { login, register } from '../../components/AuthApi.js'
import { Colors, FontFamily, FontSize, Radii } from '../../constants/theme';

export default function Signup() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('' );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // calls signup API
  const handleSignup = async () => {
    setSubmitting(true);
    const ok = await register(username, name, email, password);
    if (ok === true) {
      const res = await login(username, password);
      if (res === true) {
        router.push('/(auth)/(onboarding)/maincause');
      }
      else {
        console.log("Failed to Login");
        console.log(email);
        console.log(username);
        setSubmitting(false);
      }
    } else {
      setSubmitting(false);
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
        <Text style={styles.stepText}>STEP 1 OF 3</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>
        {"Your journey to recovery starts here. We're with you every step of the way."}
      </Text>

      {/* Quote card */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteMark}>“</Text>
        <Text style={styles.quoteText}>
          {"Recovery is not for people who need it, it's for people who want it. We are so glad you're here."}
        </Text>
      </View>

      {/* Preferred Name */}
      <Text style={styles.label}>Preferred Name</Text>
      <View style={styles.inputRow}>
        <Ionicons name="person-outline" size={19} color={Colors.inkFaint} />
        <TextInput
          style={styles.input}
          placeholder="Alex"
          placeholderTextColor={Colors.inkFaint}
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Username */}
      <Text style={styles.label}>Username</Text>
      <View style={styles.inputRow}>
        <Ionicons name="at-outline" size={19} color={Colors.inkFaint} />
        <TextInput
          style={styles.input}
          placeholder="alex123"
          placeholderTextColor={Colors.inkFaint}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      {/* Email */}
      <Text style={styles.label}>Email Address</Text>
      <View style={styles.inputRow}>
        <Ionicons name="mail-outline" size={19} color={Colors.inkFaint} />
        <TextInput
          style={styles.input}
          placeholder="alex@example.com"
          placeholderTextColor={Colors.inkFaint}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password */}
      <Text style={styles.label}>Create Password</Text>
      <View style={styles.inputRow}>
        <Ionicons name="lock-closed-outline" size={19} color={Colors.inkFaint} />
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={Colors.inkFaint}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={19} color={Colors.inkFaint} />
        </TouchableOpacity>
      </View>

      {/* Terms checkbox */}
      <View style={styles.termsRow}>
        <TouchableOpacity
          style={[styles.checkbox, agreed && styles.checkboxChecked]}
          onPress={() => setAgreed(v => !v)}
        >
          {agreed && <Ionicons name="checkmark" size={13} color="white" />}
        </TouchableOpacity>
        <Text style={styles.termsText}>
          {"I agree to the "}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {" and "}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, (!agreed || submitting) && { opacity: 0.6 }]}
        onPress={handleSignup}
        disabled={!agreed || submitting}
      >
        {submitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.primaryButtonText}>Continue</Text>
        )}
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
  },

  /* Top row */
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginBottom: 28,
  },
  progressFill: {
    height: 5,
    width: '33%',
    backgroundColor: Colors.plum,
    borderRadius: 3,
  },

  /* Title */
  title: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.hTitle,
    letterSpacing: -0.3,
    color: Colors.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.bodyMd,
    color: Colors.inkSoft,
    lineHeight: 21,
    marginBottom: 20,
  },

  /* Quote */
  quoteCard: {
    flexDirection: 'row',
    backgroundColor: Colors.plumTint2,
    borderRadius: 15,
    padding: 16,
    gap: 10,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  quoteMark: {
    fontFamily: FontFamily.serifRegular,
    fontSize: 34,
    lineHeight: 28,
    color: Colors.plumSoft,
  },
  quoteText: {
    flex: 1,
    fontFamily: FontFamily.serifItalic,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
    lineHeight: 21,
  },

  /* Form */
  label: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.eyebrow,
    color: Colors.inkSoft,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: 13,
    paddingHorizontal: 14,
    marginBottom: 18,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
    marginLeft: 10,
  },

  /* Terms */
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 24,
    marginTop: 4,
  },
  checkbox: {
    width: 21,
    height: 21,
    borderWidth: 1.6,
    borderColor: '#cabfce',
    borderRadius: 6,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  termsLink: {
    color: Colors.plum,
    fontFamily: FontFamily.sansSemibold,
  },

  /* Button */
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.plum,
    borderRadius: Radii.btn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
  },
});
