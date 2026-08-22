import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { verifyEmailCode, resendVerificationCode } from '@/components/AuthApi';
import { useAuth } from '@/context/AuthContext';
import { Colors, FontFamily, FontSize, Radii } from '@/constants/theme';

const RESEND_COOLDOWN_SECONDS = 60;


export default function VerifyEmailForm({ onVerified }) {
  const { refreshUserData } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    setError('');
    setVerifying(true);
    const result = await verifyEmailCode(code);
    setVerifying(false);
    if (result?.success) {
      await refreshUserData();
      onVerified?.();
    } else {
      setError(result?.error || 'Something went wrong. Please try again.');
    }
  };

  const handleResend = async () => {
    setError('');
    setResending(true);
    const result = await resendVerificationCode();
    setResending(false);
    if (result?.success) {
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } else {
      setCooldown(result?.retry_after_seconds ?? 0);
      setError(result?.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.codeInput}
        placeholder="000000"
        placeholderTextColor={Colors.inkFaint}
        value={code}
        onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        textAlign="center"
      />

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[styles.primaryButton, (code.length !== 6 || verifying) && { opacity: 0.6 }]}
        onPress={handleVerify}
        disabled={code.length !== 6 || verifying}
      >
        {verifying ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Verify</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend} disabled={resending || cooldown > 0} style={styles.resendRow}>
        <Text style={[styles.resendText, (resending || cooldown > 0) && { opacity: 0.5 }]}>
          {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? 'Sending…' : 'Resend code'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
  },
  codeInput: {
    width: '100%',
    height: 58,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: 13,
    fontFamily: FontFamily.sansBold,
    fontSize: 24,
    letterSpacing: 8,
    color: Colors.ink,
    marginBottom: 12,
  },
  errorText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.secondarySm,
    color: Colors.alert,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.plum,
    borderRadius: Radii.btn,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
  },
  resendRow: {
    marginTop: 20,
  },
  resendText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondary,
    color: Colors.plum,
  },
});
