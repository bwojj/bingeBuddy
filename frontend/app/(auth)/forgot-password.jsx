import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { requestPasswordReset } from '../../components/AuthApi';
import { Colors, FontFamily, FontSize, Radii } from '../../constants/theme';

export default function ForgotPassword() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter the email on your account.');
      return;
    }
    setSubmitting(true);
    const result = await requestPasswordReset(email.trim());
    setSubmitting(false);
    if (result?.success) {
      router.push({ pathname: '/(auth)/reset-password', params: { email: email.trim() } });
    } else {
      Alert.alert('Something Went Wrong', result?.error || 'Please try again.');
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
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.iconCircle}>
          <Ionicons name="key-outline" size={40} color={Colors.plum} />
        </View>
        <Text style={styles.title}>Forgot your password?</Text>
        <Text style={styles.subtitle}>
          {"Enter the email on your account and we'll send you a code to reset your password."}
        </Text>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={19} color={Colors.inkFaint} />
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={Colors.inkFaint}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, submitting && { opacity: 0.6 }]}
          onPress={handleSend}
          activeOpacity={0.85}
          disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator color="white" />
            : <>
                <Text style={styles.primaryButtonText}>Send Reset Code</Text>
                <Ionicons name="arrow-forward" size={19} color="white" />
              </>
          }
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
    paddingHorizontal: 26,
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.hTitle,
    color: Colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.bodyMd,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  label: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.eyebrow,
    color: Colors.inkSoft,
    alignSelf: 'flex-start',
    marginBottom: 7,
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
    marginBottom: 24,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
    marginLeft: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    gap: 9,
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
