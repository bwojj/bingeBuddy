import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { login, register } from '../../components/AuthApi.js'

export default function Signup() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('' );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // calls signup API 
  const handleSignup = async () => {
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
      }
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.stepText}>STEP 1 OF 4</Text>
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
        <MaterialCommunityIcons name="format-quote-open" size={24} color="#7B1FA2" />
        <Text style={styles.quoteText}>
          {"\"Recovery is not for people who need it, it's for people who want it. We are so glad you're here.\""}
        </Text>
      </View>

      {/* Preferred Name */}
      <Text style={styles.label}>Preferred Name</Text>
      <View style={styles.inputRow}>
        <Ionicons name="person-outline" size={20} color="#999" />
        <TextInput
          style={styles.input}
          placeholder="Alex"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />
      </View>

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

      {/* Email */}
      <Text style={styles.label}>Email Address</Text>
      <View style={styles.inputRow}>
        <Ionicons name="mail-outline" size={20} color="#999" />
        <TextInput
          style={styles.input}
          placeholder="alex@example.com"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password */}
      <Text style={styles.label}>Create Password</Text>
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

      {/* Terms checkbox */}
      <View style={styles.termsRow}>
        <TouchableOpacity
          style={[styles.checkbox, agreed && styles.checkboxChecked]}
          onPress={() => setAgreed(v => !v)}
        >
          {agreed && <Ionicons name="checkmark" size={14} color="white" />}
        </TouchableOpacity>
        <Text style={styles.termsText}>
          {"I agree to the "}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {" and "}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>

      {/* Continue button router.push('/(auth)/(onboarding)/maincause')*/}
      <TouchableOpacity style={[styles.primaryButton, !agreed && { opacity: 0.4 }]} onPress={handleSignup} disabled={!agreed}>
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
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
  },

  /* Top row */
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 1,
  },

  /* Progress bar */
  progressTrack: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 28,
  },
  progressFill: {
    height: 4,
    width: '25%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },

  /* Title */
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },

  /* Quote */
  quoteCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f4fc',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#ece3f0',
  },
  quoteText: {
    flex: 1,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#555',
    lineHeight: 20,
  },

  /* Form */
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
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

  /* Terms */
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 24,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 4,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7B1FA2',
    borderColor: '#7B1FA2',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
  },
  termsLink: {
    color: '#7B1FA2',
    fontWeight: '600',
  },

  /* Button */
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#7B1FA2',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
