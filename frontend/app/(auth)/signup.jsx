import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Signup() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <Ionicons name="chevron-back" size={26} color="#333" />
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
        <Text style={styles.inputPlaceholder}>Alex</Text>
      </View>

      {/* Email */}
      <Text style={styles.label}>Email Address</Text>
      <View style={styles.inputRow}>
        <Ionicons name="mail-outline" size={20} color="#999" />
        <Text style={styles.inputPlaceholder}>alex@example.com</Text>
      </View>

      {/* Password */}
      <Text style={styles.label}>Create Password</Text>
      <View style={styles.inputRow}>
        <Ionicons name="lock-closed-outline" size={20} color="#999" />
        <Text style={styles.inputDots}>••••••••</Text>
        <Ionicons name="eye-outline" size={20} color="#999" style={styles.eyeIcon} />
      </View>

      {/* Terms checkbox */}
      <View style={styles.termsRow}>
        <View style={styles.checkbox} />
        <Text style={styles.termsText}>
          {"I agree to the "}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {" and "}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>

      {/* Continue button */}
      <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(auth)/(onboarding)/maincause')}>
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
