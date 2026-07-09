import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { login } from '../../components/AuthApi';
import { useAuth } from '../../context/AuthContext';
import { Colors, FontFamily, FontSize, Radii } from '../../constants/theme';

export default function Login() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setIsAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const ok = await login(username, password);
    if (ok === true) {
      setIsAuthenticated(true);
    } else {
      Alert.alert('Login failed', 'Incorrect username or password.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 30 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Logo */}
      <Image
        source={require('../../assets/images/bingebuddy3.png')}
        style={styles.logoImage}
      />

      {/* Title */}
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Your recovery journey continues here.</Text>

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

      {/* Password */}
      <Text style={styles.label}>Password</Text>
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

      {/* Forgot password */}
      <TouchableOpacity onPress={() => {}}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      {/* Login button */}
      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.85}>
        <Text style={styles.primaryButtonText}>Log In</Text>
        <Ionicons name="arrow-forward" size={19} color="white" />
      </TouchableOpacity>

      {/* Sign up link */}
      <View style={styles.bottomLinkRow}>
        <Text style={styles.bottomLinkText}>{"Don't have an account? "}</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
          <Text style={styles.bottomLinkAction}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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

  /* Logo */
  logoImage: {
    width: 76,
    height: 76,
    borderRadius: 22,
    marginBottom: 22,
  },

  /* Title */
  title: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.authTitle,
    letterSpacing: -0.3,
    color: Colors.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.bodyMd,
    color: Colors.inkSoft,
    marginBottom: 32,
    textAlign: 'center',
  },

  /* Form */
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

  /* Forgot */
  forgotText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondary,
    color: Colors.plum,
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },

  /* Button */
  primaryButton: {
    flexDirection: 'row',
    gap: 9,
    width: '100%',
    height: 52,
    backgroundColor: Colors.plum,
    borderRadius: Radii.btn,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  primaryButtonText: {
    color: 'white',
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
  },

  /* Bottom link */
  bottomLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomLinkText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.bodyMd,
    color: Colors.inkSoft,
  },
  bottomLinkAction: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.bodyMd,
    color: Colors.plum,
  },
});
