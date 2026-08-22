import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { requestPasswordReset, resetPassword } from '../../components/AuthApi';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '../../constants/theme';

const RESEND_COOLDOWN_SECONDS = 60;

// emailed by forgot-password.jsx.
export default function ResetPassword() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSave = async () => {
    if (code.length !== 6) {
      Alert.alert('Code Required', 'Enter the 6-digit code we emailed you.');
      return;
    }
    if (!newPassword || newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    const result = await resetPassword(email, code, newPassword);
    setSaving(false);

    if (result?.success) {
      Alert.alert('Password Reset', 'Your password has been updated. Please log in.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } else {
      Alert.alert('Error', result?.error ?? 'Failed to reset your password. Please try again.');
    }
  };

  const handleResend = async () => {
    setResending(true);
    const result = await requestPasswordReset(email);
    setResending(false);
    if (result?.success) {
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } else {
      Alert.alert('Error', result?.error ?? 'Failed to resend the code. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
          <Text style={styles.headerTitle}>Reset Password</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        {/* Reset Password */}
        <Text style={styles.sectionLabel}>RESET PASSWORD</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>
            {email ? `Code sent to ${email}` : 'Code'}
          </Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="6-digit code"
            placeholderTextColor={Colors.inkFaint}
            keyboardType="number-pad"
            maxLength={6}
          />
          <View style={styles.divider} />
          <Text style={styles.fieldLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor={Colors.inkFaint}
            secureTextEntry
            textContentType="password"
            autoComplete="password"
          />
          <View style={styles.divider} />
          <Text style={styles.fieldLabel}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter new password"
            placeholderTextColor={Colors.inkFaint}
            secureTextEntry
            textContentType="password"
            autoComplete="password"
          />
        </View>

        <TouchableOpacity onPress={handleResend} disabled={resending || cooldown > 0} style={styles.resendRow}>
          <Text style={[styles.resendText, (resending || cooldown > 0) && { opacity: 0.5 }]}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? 'Sending…' : 'Resend code'}
          </Text>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          {saving
            ? <ActivityIndicator color="white" />
            : <Text style={styles.saveBtnText}>Reset Password</Text>
          }
        </TouchableOpacity>

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
    marginBottom: 24,
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

  /* Section Label */
  sectionLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginBottom: 8,
  },

  /* Card */
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: Radii.card,
    padding: 16,
    marginBottom: 12,
    ...Shadows.soft,
  },
  fieldLabel: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.eyebrow,
    color: Colors.inkSoft,
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.body,
    color: Colors.ink,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.bg,
    marginVertical: 8,
  },

  /* Resend */
  resendRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondary,
    color: Colors.plum,
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
});
