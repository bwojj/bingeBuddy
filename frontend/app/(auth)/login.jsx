import { Text, View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function Login() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 30 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Logo */}
      <View style={styles.logoCircle}>
        <MaterialCommunityIcons name="bandage" size={36} color="white" />
      </View>

      {/* Title */}
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Your recovery journey continues here.</Text>

      {/* Email */}
      <Text style={styles.label}>Email Address</Text>
      <View style={styles.inputRow}>
        <Ionicons name="mail-outline" size={20} color="#999" />
        <Text style={styles.inputPlaceholder}>alex@example.com</Text>
      </View>

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.inputRow}>
        <Ionicons name="lock-closed-outline" size={20} color="#999" />
        <Text style={styles.inputDots}>••••••••</Text>
        <Ionicons name="eye-off-outline" size={20} color="#999" style={styles.eyeIcon} />
      </View>

      {/* Forgot password */}
      <Text style={styles.forgotText}>Forgot Password?</Text>

      {/* Login button */}
      <View style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>{"Log In  \u2192"}</Text>
      </View>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social buttons */}
      <View style={styles.socialRow}>
        <View style={styles.socialButton}>
          <MaterialCommunityIcons name="google" size={20} color="#333" />
          <Text style={styles.socialButtonText}>Google</Text>
        </View>
        <View style={styles.socialButton}>
          <Ionicons name="logo-apple" size={20} color="#333" />
          <Text style={styles.socialButtonText}>Apple</Text>
        </View>
      </View>

      {/* Sign up link */}
      <View style={styles.bottomLinkRow}>
        <Text style={styles.bottomLinkText}>{"Don't have an account? "}</Text>
        <Text style={styles.bottomLinkAction}>Sign Up</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },

  /* Logo */
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#7B1FA2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  /* Title */
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7B1FA2',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
  },

  /* Form */
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
    backgroundColor: '#fafafa',
  },
  inputPlaceholder: {
    fontSize: 15,
    color: '#aaa',
    marginLeft: 10,
    flex: 1,
  },
  inputDots: {
    fontSize: 18,
    color: '#333',
    marginLeft: 10,
    flex: 1,
    letterSpacing: 2,
  },
  eyeIcon: {
    marginLeft: 'auto',
  },

  /* Forgot */
  forgotText: {
    fontSize: 13,
    color: '#7B1FA2',
    fontWeight: '600',
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },

  /* Button */
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#7B1FA2',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  /* Divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    marginHorizontal: 14,
    letterSpacing: 1,
  },

  /* Social */
  socialRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 28,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  /* Bottom link */
  bottomLinkRow: {
    flexDirection: 'row',
  },
  bottomLinkText: {
    fontSize: 14,
    color: '#666',
  },
  bottomLinkAction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7B1FA2',
  },
});
