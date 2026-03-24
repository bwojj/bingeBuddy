import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { motivation } from '../../../components/OnboardingApi';
import { addMotivationImage } from '../../../components/DataAPI';
import { useAuth } from '../../../context/AuthContext';

export default function Motivation() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setIsAuthenticated } = useAuth();
  const [myWhy, setMyWhy] = useState('');
  const [photoAsset, setPhotoAsset] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to set a motivation image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoAsset(result.assets[0]);
    }
  };

  const handleFinish = async () => {
    const [whyOk, imageOk] = await Promise.all([
      motivation(myWhy),
      addMotivationImage(photoAsset),
    ]);
    if (whyOk && imageOk) {
      setIsAuthenticated(true);
    } else {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.stepText}>STEP 3 OF 3</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={styles.progressMeta}>
          <Text style={styles.finalStepLabel}>FINAL STEP</Text>
          <Text style={styles.progressPercent}>100%</Text>
        </View>
        <View style={styles.progressFill} />
      </View>

      {/* Icon */}
      <View style={styles.iconWrapper}>
        <View style={styles.iconCircle}>
          <Ionicons name="heart-outline" size={32} color="#7e1f8c" />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>{"What's your \"why\"?"}</Text>
      <Text style={styles.subtitle}>
        Write a personal reminder of why you want to change, and add a photo that inspires you.
      </Text>

      {/* My Why input */}
      <Text style={styles.fieldLabel}>My Why</Text>
      <View style={styles.whyCard}>
        <TextInput
          style={styles.whyInput}
          placeholder="e.g. Being present for my kids..."
          placeholderTextColor="#bbb"
          value={myWhy}
          onChangeText={setMyWhy}
          multiline
          maxLength={200}
        />
        <Text style={styles.charCount}>{myWhy.length}/200</Text>
      </View>

      {/* Motivation photo */}
      <Text style={styles.fieldLabel}>Motivation Photo</Text>
      <TouchableOpacity style={styles.photoCard} onPress={pickImage} activeOpacity={0.85}>
        {photoAsset ? (
          <Image source={{ uri: photoAsset.uri }} style={styles.photoImage} resizeMode="cover" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <View style={styles.cameraCircle}>
              <Ionicons name="camera-outline" size={28} color="#7e1f8c" />
            </View>
            <Text style={styles.photoPlaceholderText}>Tap to add a photo</Text>
            <Text style={styles.photoPlaceholderSub}>Optional — appears on your dashboard</Text>
          </View>
        )}
        {photoAsset && (
          <View style={styles.photoOverlay}>
            <View style={styles.changePhotoBadge}>
              <Ionicons name="camera-outline" size={13} color="white" />
              <Text style={styles.changePhotoText}>Change</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Finish button */}
      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>Finish</Text>
        <Ionicons name="checkmark" size={18} color="white" style={{ marginLeft: 8 }} />
      </TouchableOpacity>

      <Text style={styles.footerNote}>You can update these anytime in Settings.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    paddingHorizontal: 24,
  },

  /* Top row */
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
    letterSpacing: 1,
  },

  /* Progress bar */
  progressTrack: {
    marginBottom: 32,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  finalStepLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7e1f8c",
    letterSpacing: 0.5,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7e1f8c",
  },
  progressFill: {
    height: 4,
    width: "100%",
    backgroundColor: "#7e1f8c",
    borderRadius: 2,
  },

  /* Icon */
  iconWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ede9ee",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Title */
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 32,
  },

  /* Field label */
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7e1f8c",
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  /* My Why */
  whyCard: {
    backgroundColor: '#fafafa',
    borderWidth: 1.5,
    borderColor: '#e8e3ea',
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
  },
  whyInput: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: '#bbb',
    textAlign: 'right',
    marginTop: 6,
  },

  /* Photo */
  photoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 170,
    backgroundColor: '#ede9ee',
    marginBottom: 32,
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cameraCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  photoPlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7e1f8c',
    textAlign: 'center',
  },
  photoPlaceholderSub: {
    fontSize: 12,
    color: '#7a5080',
    marginTop: 4,
    textAlign: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 10,
  },
  changePhotoBadge: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  changePhotoText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },

  /* Finish button */
  finishButton: {
    flexDirection: "row",
    width: "100%",
    height: 52,
    backgroundColor: "#7e1f8c",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  finishButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  /* Footer */
  footerNote: {
    textAlign: "center",
    fontSize: 12,
    color: "#AAA",
  },
});
