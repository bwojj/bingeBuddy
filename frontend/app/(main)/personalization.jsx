import {
  Text, View, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

/* ── Onboarding data ─────────────────────────────── */
const TRIGGERS = [
  { id: 'stress',   title: 'Stress',             subtitle: 'Feeling overwhelmed by work or life',   icon: (c) => <MaterialCommunityIcons name="lightning-bolt" size={20} color={c} /> },
  { id: 'boredom',  title: 'Boredom',             subtitle: 'Eating when there is nothing to do',    icon: (c) => <Ionicons name="time-outline" size={20} color={c} /> },
  { id: 'emotions', title: 'Difficult Emotions',  subtitle: 'Coping with sadness or anxiety',        icon: (c) => <MaterialCommunityIcons name="emoticon-sad-outline" size={20} color={c} /> },
  { id: 'social',   title: 'Social Situations',   subtitle: 'Pressure from friends or family events', icon: (c) => <Ionicons name="people-outline" size={20} color={c} /> },
];

const COACHING_STYLES = [
  { id: 'gentle',     title: 'Gentle & Supportive', subtitle: 'Encouraging words and a soft touch.', icon: (c) => <Ionicons name="heart-outline" size={20} color={c} /> },
  { id: 'firm',       title: 'Firm & Direct',        subtitle: 'Honest feedback and clear accountability.', icon: (c) => <Ionicons name="shield-outline" size={20} color={c} /> },
  { id: 'analytical', title: 'Analytical',           subtitle: 'Data-driven insights and milestones.', icon: (c) => <MaterialCommunityIcons name="chart-line-variant" size={20} color={c} /> },
];

const MOTIVATION_CHIPS = [
  { id: 'health',        label: 'Health' },
  { id: 'weight',        label: 'Weight Loss' },
  { id: 'confidence',    label: 'Confidence' },
  { id: 'mental',        label: 'Mental Clarity' },
  { id: 'money',         label: 'Save Money' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'sleep',         label: 'Sleep Quality' },
  { id: 'career',        label: 'Career Goals' },
];

/* ── Component ───────────────────────────────────── */
export default function Personalization() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [photoUri, setPhotoUri]       = useState(null);
  const [myWhy, setMyWhy]             = useState('');
  const [trigger, setTrigger]         = useState('stress');
  const [coachStyle, setCoachStyle]   = useState('gentle');
  const [motivations, setMotivations] = useState(new Set(['health']));

  const toggleMotivation = (id) => {
    setMotivations((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to set a motivation image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    Alert.alert('Saved!', 'Your personalization settings have been updated.', [
      { text: 'Great', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personalization</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Motivation Photo ── */}
        <SectionLabel icon="image-outline" label="Motivation Photo" />
        <TouchableOpacity style={styles.photoCard} onPress={pickImage} activeOpacity={0.85}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoImage} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <View style={styles.cameraCircle}>
                <Ionicons name="camera-outline" size={32} color="#7B1FA2" />
              </View>
              <Text style={styles.photoPlaceholderText}>Tap to add your motivation photo</Text>
              <Text style={styles.photoPlaceholderSub}>This image will appear on your dashboard</Text>
            </View>
          )}
          {photoUri && (
            <View style={styles.photoOverlay}>
              <View style={styles.changePhotoBadge}>
                <Ionicons name="camera-outline" size={14} color="white" />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* ── My Why ── */}
        <SectionLabel icon="heart-outline" label="My Why" />
        <View style={styles.whyCard}>
          <Text style={styles.whyDescription}>
            Write a personal reminder of why you started. This will display on your motivation card.
          </Text>
          <TextInput
            style={styles.whyInput}
            placeholder="e.g. Being present for my kids..."
            placeholderTextColor="#bbb"
            value={myWhy}
            onChangeText={setMyWhy}
            multiline
            maxLength={120}
          />
          <Text style={styles.charCount}>{myWhy.length}/120</Text>
        </View>

        {/* ── Main Trigger ── */}
        <SectionLabel icon="lightning-bolt-outline" label="Main Trigger" iconLib="material" />
        <View style={styles.optionGroup}>
          {TRIGGERS.map((opt) => {
            const sel = trigger === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionCard, sel && styles.optionCardSel]}
                onPress={() => setTrigger(opt.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.optionIconCircle, sel && styles.optionIconCircleSel]}>
                  {opt.icon(sel ? '#7B1FA2' : '#888')}
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, sel && styles.optionTitleSel]}>{opt.title}</Text>
                  <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                </View>
                {sel && <Ionicons name="checkmark-circle" size={20} color="#7B1FA2" />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Coaching Style ── */}
        <SectionLabel icon="school-outline" label="Coaching Style" />
        <View style={styles.optionGroup}>
          {COACHING_STYLES.map((opt) => {
            const sel = coachStyle === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionCard, sel && styles.optionCardSel]}
                onPress={() => setCoachStyle(opt.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.optionIconCircle, sel && styles.optionIconCircleSel]}>
                  {opt.icon(sel ? '#7B1FA2' : '#888')}
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, sel && styles.optionTitleSel]}>{opt.title}</Text>
                  <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                </View>
                {sel && <Ionicons name="checkmark-circle" size={20} color="#7B1FA2" />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Motivations ── */}
        <SectionLabel icon="ribbon-outline" label="My Motivations" />
        <View style={styles.chipsCard}>
          <Text style={styles.chipsDescription}>Select everything that drives you forward.</Text>
          <View style={styles.chipsGrid}>
            {MOTIVATION_CHIPS.map((chip) => {
              const sel = motivations.has(chip.id);
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.chip, sel && styles.chipSel]}
                  onPress={() => toggleMotivation(chip.id)}
                  activeOpacity={0.75}
                >
                  {sel && <Ionicons name="shield-checkmark" size={13} color="white" style={{ marginRight: 4 }} />}
                  <Text style={[styles.chipText, sel && styles.chipTextSel]}>{chip.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Ionicons name="checkmark" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* Small helper for section labels */
function SectionLabel({ icon, label, iconLib }) {
  return (
    <View style={styles.sectionLabelRow}>
      {iconLib === 'material'
        ? <MaterialCommunityIcons name={icon} size={16} color="#7B1FA2" style={{ marginRight: 6 }} />
        : <Ionicons name={icon} size={16} color="#7B1FA2" style={{ marginRight: 6 }} />
      }
      <Text style={styles.sectionLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3edf7' },
  scrollContent: { paddingBottom: 20 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },

  /* Section label */
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7B1FA2',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  /* Photo card */
  photoCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    backgroundColor: '#ede7f6',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cameraCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#7B1FA2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  photoPlaceholderText: { fontSize: 15, fontWeight: '600', color: '#7B1FA2', textAlign: 'center' },
  photoPlaceholderSub:  { fontSize: 12, color: '#9E6CB2', marginTop: 4, textAlign: 'center' },
  photoImage: { width: '100%', height: '100%' },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 12,
  },
  changePhotoBadge: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  changePhotoText: { fontSize: 12, color: 'white', fontWeight: '600' },

  /* My Why card */
  whyCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  whyDescription: { fontSize: 13, color: '#888', marginBottom: 10, lineHeight: 18 },
  whyInput: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
    minHeight: 72,
    textAlignVertical: 'top',
    borderWidth: 1.5,
    borderColor: '#ede7f6',
    borderRadius: 12,
    padding: 12,
  },
  charCount: { fontSize: 11, color: '#bbb', textAlign: 'right', marginTop: 6 },

  /* Option cards (trigger / coaching) */
  optionGroup: { marginHorizontal: 20, gap: 10 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    backgroundColor: 'white',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  optionCardSel: { borderColor: '#7B1FA2', backgroundColor: '#F8F2FF' },
  optionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconCircleSel: { backgroundColor: '#EDE0FA' },
  optionText: { flex: 1 },
  optionTitle:    { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 2 },
  optionTitleSel: { color: '#7B1FA2' },
  optionSubtitle: { fontSize: 12, color: '#888', lineHeight: 17 },

  /* Motivation chips */
  chipsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  chipsDescription: { fontSize: 13, color: '#888', marginBottom: 14 },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  chipSel: { backgroundColor: '#7B1FA2', borderColor: '#7B1FA2' },
  chipText:    { fontSize: 13, fontWeight: '500', color: '#333' },
  chipTextSel: { color: 'white' },

  /* Save button */
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: '#7B1FA2',
    shadowColor: '#7B1FA2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: 'white' },
});
