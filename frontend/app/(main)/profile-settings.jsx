import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { updateProfile, deleteAccount } from "@/components/DataAPI";
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';

export default function ProfileSettings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userCredentials, refreshUserData, logout } = useAuth();

  const [firstName, setFirstName] = useState(userCredentials?.first_name ?? '');
  const [email, setEmail] = useState(userCredentials?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New password and confirmation do not match.');
      return;
    }
    if (newPassword && !currentPassword) {
      Alert.alert('Current Password Required', 'Please enter your current password to set a new one.');
      return;
    }

    setSaving(true);
    const result = await updateProfile({
      first_name: firstName,
      email,
      current_password: currentPassword || undefined,
      new_password: newPassword || undefined,
    });
    setSaving(false);

    if (result?.success) {
      await refreshUserData();
      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Error', result?.error ?? 'Failed to save changes. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const result = await deleteAccount();
            setDeleting(false);
            if (result?.success) {
              await logout();
            } else {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
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
          <Text style={styles.headerTitle}>Profile Settings</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        {/* Personal Info */}
        <Text style={styles.sectionLabel}>PERSONAL INFO</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            placeholderTextColor={Colors.inkFaint}
            autoCapitalize="words"
          />
          <View style={styles.divider} />
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor={Colors.inkFaint}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Change Password */}
        <Text style={styles.sectionLabel}>CHANGE PASSWORD</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            placeholderTextColor={Colors.inkFaint}
            secureTextEntry
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
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          {saving
            ? <ActivityIndicator color="white" />
            : <Text style={styles.saveBtnText}>Save Changes</Text>
          }
        </TouchableOpacity>

        {/* Danger Zone */}
        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>DANGER ZONE</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} disabled={deleting} activeOpacity={0.85}>
          {deleting
            ? <ActivityIndicator color={Colors.alert} />
            : <Text style={styles.deleteBtnText}>Delete Account</Text>
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
    marginBottom: 24,
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

  /* Delete Button */
  deleteBtn: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: Radii.btn,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(178,58,54,0.5)',
    marginBottom: 8,
  },
  deleteBtnText: {
    color: Colors.alert,
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
  },
});
