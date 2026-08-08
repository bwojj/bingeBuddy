import {
  Text, View, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/context/AuthContext';
import { updateReminderPreferences } from '@/components/DataAPI';
import { requestNotificationPermissionsAsync, scheduleHabitReminder, cancelHabitReminder } from '@/lib/notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';

const DEFAULT_HOUR = 19; // 7:00 PM

function defaultTime() {
  const d = new Date();
  d.setHours(DEFAULT_HOUR, 0, 0, 0);
  return d;
}

function formatTime(d) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function NotificationSettings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userPreferences, refreshUserData } = useAuth();

  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState(defaultTime());
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userPreferences) return;
    setEnabled(!!userPreferences.reminder_enabled);
    if (userPreferences.reminder_time) {
      const [hours, minutes] = userPreferences.reminder_time.split(':').map(Number);
      const d = new Date();
      d.setHours(hours, minutes, 0, 0);
      setTime(d);
    }
  }, [userPreferences]);

  const handleToggle = async (value) => {
    if (value) {
      const granted = await requestNotificationPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Permission needed',
          'Enable notifications for My Binge Buddy in your device Settings to get daily reminders.'
        );
        return;
      }
    }
    setEnabled(value);
  };

  const handleTimeChange = (event, selected) => {
    // Android's picker is a native modal dialog that dismisses itself once a
    // value is confirmed, so unmount it here too. iOS's inline spinner has no
    // such dialog -- it should stay open across scrubbing and only close when
    // Save is pressed (see handleSave).
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setTime(selected);
  };

  const handleSave = async () => {
    setShowPicker(false);
    setSaving(true);
    const reminder_time = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    const ok = await updateReminderPreferences({ reminder_enabled: enabled, reminder_time });

    if (ok) {
      if (enabled) {
        await scheduleHabitReminder(time.getHours(), time.getMinutes());
      } else {
        await cancelHabitReminder();
      }
      await refreshUserData();
    }
    setSaving(false);

    if (ok) {
      Alert.alert('Saved!', 'Your reminder preferences have been updated.', [
        { text: 'Great', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Failed', 'Your reminder preferences have not been updated.', [
        { text: 'Ok' },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Gradients.hero.colors}
        start={Gradients.hero.start}
        end={Gradients.hero.end}
        style={[styles.topbar, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Notifications</Text>
        <View style={styles.backBtn} />
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>DAILY REMINDER</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Remind Me Daily</Text>
              <Text style={styles.rowSubtitle}>Get a nudge to check in on your habits</Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={handleToggle}
              trackColor={{ false: Colors.line, true: Colors.plum }}
              thumbColor="white"
            />
          </View>

          {enabled && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.row} onPress={() => setShowPicker((prev) => !prev)} activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>Reminder Time</Text>
                  <Text style={styles.rowSubtitle}>Fires every day at this time</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={16} color={Colors.plum} />
                  <Text style={styles.timeBadgeText}>{formatTime(time)}</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {enabled && showPicker && (
            <View style={styles.pickerWrap}>
              <DateTimePicker
                value={time}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                accentColor={Colors.plum}
                themeVariant="light"
              />
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          <Ionicons name="checkmark" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  topbarTitle: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.topbarTitle,
    color: 'white',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },

  sectionLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginBottom: 8,
  },

  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: Radii.card,
    marginBottom: 24,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
  },
  rowSubtitle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.eyebrow,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.bg,
    marginLeft: 16,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.plumTint,
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  timeBadgeText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
    color: Colors.plum,
  },
  pickerWrap: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: Radii.pill,
    backgroundColor: Colors.plum,
    ...Shadows.pop,
  },
  saveBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
    color: 'white',
  },
});
