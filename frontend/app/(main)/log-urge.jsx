import { Text, View, StyleSheet, TouchableOpacity, TextInput, Platform, Pressable, ScrollView, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePostHog } from 'posthog-react-native';
import { logUrge } from '@/components/UrgeAPI';
import { useAuth } from '@/context/AuthContext';
import { maybeRequestReview } from '@/lib/reviewPrompt';
import { Colors, FontFamily, FontSize, Radii, Shadows } from '@/constants/theme';

function formatDisplayDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function LogUrge() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { refreshUserData, userPreferences } = useAuth();
  const posthog = usePostHog();
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  function handleNoteFocus() {
    // Extra bottom padding (below) already made room to scroll this far —
    // scrolling to the end lands the note card + Done button right above the keyboard.
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }

  function handleDateChange(event, selected) {
    Keyboard.dismiss();
    setShowPicker(false);
    if (selected) setDate(selected);
  }

  function handleDateFieldPress() {
    Keyboard.dismiss();
    setShowPicker((prev) => !prev);
  }

  async function handleDone() {
    setSaving(true);
    const ok = await logUrge(note.trim(), date.toISOString());
    setSaving(false);
    if (ok) {
      posthog?.capture('urge_logged', { has_note: note.trim().length > 0 });
      await refreshUserData();
      maybeRequestReview();
    }
    router.replace(userPreferences?.seen_recovery_intro ? '/my-plan' : '/recovery-intro');
  }

  return (
    <Pressable style={styles.container} onPress={() => setShowPicker(false)}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: 30 + keyboardHeight }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.ink} />
          </TouchableOpacity>
        </View>

        {/* Celebration */}
        <View style={styles.celebrateBlock}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="trophy" size={44} color={Colors.plum} />
          </View>
          <Text style={styles.title}>You Did It!</Text>
          <Text style={styles.subtitle}>
            You just beat an urge — that&apos;s one more step closer to a binge-free life. This is huge.
          </Text>
        </View>

        {/* Date */}
        <Text style={styles.fieldLabel}>When did this happen?</Text>
        <TouchableOpacity style={styles.dateField} onPress={handleDateFieldPress} activeOpacity={0.7}>
          <Ionicons name="calendar-outline" size={18} color={Colors.plum} />
          <Text style={styles.dateFieldText}>{formatDisplayDate(date)}</Text>
        </TouchableOpacity>
        {showPicker && (
          <View style={styles.pickerWrap}>
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              maximumDate={new Date()}
              onChange={handleDateChange}
              accentColor={Colors.plum}
              themeVariant="light"
            />
          </View>
        )}

        {/* Note */}
        <Text style={styles.fieldLabel}>How do you feel?</Text>
        <View style={styles.noteCard}>
          <TextInput
            style={styles.noteInput}
            placeholder="I feel proud that I..."
            placeholderTextColor={Colors.inkFaint}
            value={note}
            onChangeText={setNote}
            onFocus={handleNoteFocus}
            multiline
            maxLength={300}
          />
        </View>

        <TouchableOpacity style={styles.doneBtn} onPress={handleDone} disabled={saving} activeOpacity={0.85}>
          <Text style={styles.doneBtnText}>{saving ? 'Saving…' : 'Done'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    paddingBottom: 30,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },

  /* Celebration */
  celebrateBlock: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 28,
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.flowTitle,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.body,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },

  /* Fields */
  fieldLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.secondary,
    color: Colors.plumSoft,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginHorizontal: 24,
    marginBottom: 10,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.plumTint2,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  dateFieldText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.body,
    color: Colors.ink,
  },
  pickerWrap: {
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
  },
  noteCard: {
    backgroundColor: Colors.plumTint2,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 24,
    marginBottom: 28,
  },
  noteInput: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.body,
    color: Colors.ink,
    lineHeight: 22,
    minHeight: 88,
    textAlignVertical: 'top',
  },

  /* Done */
  doneBtn: {
    backgroundColor: Colors.plum,
    borderRadius: Radii.pill,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    ...Shadows.pop,
  },
  doneBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
    color: 'white',
  },
});
