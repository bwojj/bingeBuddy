import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { login } from '../../components/AuthApi';
import { useAuth } from '../../context/AuthContext';

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
        source={require('../../assets/images/bblogo.jpg')}
        style={styles.logoImage}
      />

      {/* Title */}
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Your recovery journey continues here.</Text>

      {/* Username */}
      <Text style={styles.label}>Username</Text>
      <View style={styles.inputRow}>
        <Ionicons name="at-outline" size={20} color="#999" />
        <TextInput
          style={styles.input}
          placeholder="alex123"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.inputRow}>
        <Ionicons name="lock-closed-outline" size={20} color="#999" />
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Forgot password */}
      <TouchableOpacity onPress={() => {}}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login button */}
      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.primaryButtonText}>{"Log In  \u2192"}</Text>
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
    backgroundColor: 'white',
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },

  /* Logo */
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 24,
  },

  /* Title */
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7e1f8c',
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
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },

  /* Forgot */
  forgotText: {
    fontSize: 13,
    color: '#7e1f8c',
    fontWeight: '600',
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },

  /* Button */
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#7e1f8c',
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

  /* Bottom link */
  bottomLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomLinkText: {
    fontSize: 14,
    color: '#666',
  },
  bottomLinkAction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7e1f8c',
  },
});
