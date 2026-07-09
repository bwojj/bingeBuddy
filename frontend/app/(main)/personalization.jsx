import {
  Text, View, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { addMotivationImage } from '../../components/DataAPI'; 
import { motivation } from '../../components/OnboardingApi'
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';

/* ── Onboarding data ─────────────────────────────── */
const TRIGGERS = [
  { id: 'stress',   title: 'Stress',             subtitle: 'Feeling overwhelmed by work or life',   icon: (c) => <MaterialCommunityIcons name="lightning-bolt" size={20} color={c} /> },
  { id: 'boredom',  title: 'Boredom',             subtitle: 'Eating when there is nothing to do',    icon: (c) => <Ionicons name="time-outline" size={20} color={c} /> },
  { id: 'emotions', title: 'Difficult Emotions',  subtitle: 'Coping with sadness or anxiety',        icon: (c) => <MaterialCommunityIcons name="emoticon-sad-outline" size={20} color={c} /> },
  { id: 'social',   title: 'Social Situations',   subtitle: 'Pressure from friends or family events', icon: (c) => <Ionicons name="people-outline" size={20} color={c} /> },
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

  const [photoAsset, setPhotoAsset]   = useState(null);
  const [myWhy, setMyWhy]             = useState('');
  const [trigger, setTrigger]         = useState('stress');
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
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoAsset(result.assets[0]);
    }
  };

  const handleSave = async () => {
    const motivationImageOk = await addMotivationImage(photoAsset);
    const motivationOk = await motivation(myWhy); 
    if(motivationImageOk && motivationOk){
      Alert.alert('Saved!', 'Your personalization settings have been updated.', [
        { text: 'Great', onPress: () => router.back() },
      ]);
    } else{
      Alert.alert('Failed', 'Your personalization settings have not been updated.', [
        { text: 'Ok', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          <Text style={styles.headerTitle}>Personalization</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        {/* ── Motivation Photo ── */}
        <SectionLabel icon="image-outline" label="Motivation Photo" />
        <TouchableOpacity style={styles.photoCard} onPress={pickImage} activeOpacity={0.85}>
          {photoAsset ? (
            <Image source={{ uri: photoAsset.uri }} style={styles.photoImage} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <View style={styles.cameraCircle}>
                <Ionicons name="camera-outline" size={32} color={Colors.plum} />
              </View>
              <Text style={styles.photoPlaceholderText}>Tap to add your motivation photo</Text>
              <Text style={styles.photoPlaceholderSub}>This image will appear on your dashboard</Text>
            </View>
          )}
          {photoAsset && (
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
            placeholderTextColor={Colors.inkFaint}
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
                  {opt.icon(sel ? Colors.plum : Colors.inkSoft)}
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, sel && styles.optionTitleSel]}>{opt.title}</Text>
                  <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                </View>
                {sel && <Ionicons name="checkmark-circle" size={20} color={Colors.plum} />}
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
        ? <MaterialCommunityIcons name={icon} size={16} color={Colors.plum} style={{ marginRight: 6 }} />
        : <Ionicons name={icon} size={16} color={Colors.plum} style={{ marginRight: 6 }} />
      }
      <Text style={styles.sectionLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.plumDeep },
  scrollContent: { flexGrow: 1, backgroundColor: Colors.bg, paddingBottom: 20 },

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
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: { fontFamily: FontFamily.serifMedium, fontSize: FontSize.topbarTitle, color: 'white' },

  /* Section label */
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 24,
  },
  sectionLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.secondary,
    color: Colors.plumSoft,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  /* Photo card */
  photoCard: {
    marginHorizontal: 20,
    borderRadius: Radii.card,
    overflow: 'hidden',
    height: 180,
    backgroundColor: Colors.plumTint2,
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
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Shadows.soft,
  },
  photoPlaceholderText: { fontFamily: FontFamily.sansBold, fontSize: FontSize.body, color: Colors.plum, textAlign: 'center' },
  photoPlaceholderSub:  { fontFamily: FontFamily.sansRegular, fontSize: FontSize.eyebrow, color: Colors.plumSoft, marginTop: 4, textAlign: 'center' },
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
    backgroundColor: 'rgba(37,24,38,0.45)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  changePhotoText: { fontFamily: FontFamily.sansSemibold, fontSize: FontSize.eyebrow, color: 'white' },

  /* My Why card */
  whyCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: Radii.card,
    padding: 16,
    ...Shadows.soft,
  },
  whyDescription: { fontFamily: FontFamily.sansRegular, fontSize: FontSize.secondarySm, color: Colors.inkSoft, marginBottom: 10, lineHeight: 18 },
  whyInput: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.body,
    color: Colors.ink,
    lineHeight: 22,
    minHeight: 72,
    textAlignVertical: 'top',
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: 12,
    padding: 12,
  },
  charCount: { fontFamily: FontFamily.sansRegular, fontSize: FontSize.eyebrowSm, color: Colors.inkFaint, textAlign: 'right', marginTop: 6 },

  /* Option cards (trigger / coaching) */
  optionGroup: { marginHorizontal: 20, gap: 10 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: 15,
    padding: 14,
    backgroundColor: Colors.surface,
    gap: 12,
    ...Shadows.soft,
  },
  optionCardSel: { borderColor: Colors.plum, backgroundColor: Colors.plumTint2 },
  optionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F1EFF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconCircleSel: { backgroundColor: Colors.plumTint },
  optionText: { flex: 1 },
  optionTitle:    { fontFamily: FontFamily.sansBold, fontSize: FontSize.bodyMd, color: Colors.ink, marginBottom: 2 },
  optionTitleSel: { color: Colors.plum },
  optionSubtitle: { fontFamily: FontFamily.sansRegular, fontSize: FontSize.eyebrow, color: Colors.inkSoft, lineHeight: 17 },

  /* Motivation chips */
  chipsCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: Radii.card,
    padding: 16,
    ...Shadows.soft,
  },
  chipsDescription: { fontFamily: FontFamily.sansRegular, fontSize: FontSize.secondarySm, color: Colors.inkSoft, marginBottom: 14 },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: Radii.pill,
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: Colors.surface,
  },
  chipSel: { backgroundColor: Colors.plum, borderColor: Colors.plum },
  chipText:    { fontFamily: FontFamily.sansMedium, fontSize: FontSize.secondarySm, color: Colors.ink },
  chipTextSel: { color: 'white' },

  /* Save button */
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: Radii.pill,
    backgroundColor: Colors.plum,
    ...Shadows.pop,
  },
  saveBtnText: { fontFamily: FontFamily.sansBold, fontSize: FontSize.body, color: 'white' },
});
