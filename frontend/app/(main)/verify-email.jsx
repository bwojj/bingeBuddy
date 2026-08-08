import { Text, View, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import VerifyEmailForm from '@/app/components/VerifyEmailForm';
import { Colors, FontFamily, FontSize, Shadows } from '@/constants/theme';

export default function VerifyEmail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleVerified = () => {
    Alert.alert('Email verified', 'Your email has been verified.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.ink} />
          </TouchableOpacity>
        </View>

        <View style={styles.iconCircle}>
          <Ionicons name="mail-outline" size={40} color={Colors.plum} />
        </View>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code we sent to your email address.
        </Text>

        <VerifyEmailForm onVerified={handleVerified} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.plumTint2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
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
});
