import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { TouchableOpacity as GestureTouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Radii, Shadows } from '@/constants/theme';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TODAY_IDX = (new Date().getDay() + 6) % 7;

export const HABIT_ICONS = {
  meditation: { lib: MaterialCommunityIcons, name: 'meditation' },
  exercise: { lib: Ionicons, name: 'barbell-outline' },
  journaling: { lib: Ionicons, name: 'book-outline' },
  checkin: { lib: Ionicons, name: 'clipboard-outline' },
  custom: { lib: Ionicons, name: 'star-outline' },
  water: { lib: MaterialCommunityIcons, name: 'cup-water' },
  sleep: { lib: Ionicons, name: 'moon-outline' },
  walk: { lib: Ionicons, name: 'walk-outline' },
  nutrition: { lib: MaterialCommunityIcons, name: 'food-apple-outline' },
  gratitude: { lib: Ionicons, name: 'heart-outline' },
  creative: { lib: Ionicons, name: 'color-palette-outline' },
  social: { lib: Ionicons, name: 'people-outline' },
  music: { lib: Ionicons, name: 'musical-notes-outline' },
  reading: { lib: MaterialCommunityIcons, name: 'book-open-page-variant-outline' },
  yoga: { lib: MaterialCommunityIcons, name: 'yoga' },
  sunlight: { lib: Ionicons, name: 'sunny-outline' },
  writing: { lib: Ionicons, name: 'pencil-outline' },
  cooking: { lib: MaterialCommunityIcons, name: 'chef-hat' },
  finance: { lib: Ionicons, name: 'wallet-outline' },
  work: { lib: Ionicons, name: 'briefcase-outline' },
  screentime: { lib: Ionicons, name: 'phone-portrait-outline' },
  pets: { lib: MaterialCommunityIcons, name: 'paw' },
  plant: { lib: Ionicons, name: 'leaf-outline' },
  goal: { lib: Ionicons, name: 'flag-outline' },
  breathing: { lib: MaterialCommunityIcons, name: 'lungs' },
  coffee: { lib: MaterialCommunityIcons, name: 'coffee-outline' },
};

export function HabitIcon({ icon, size = 22, color = Colors.plum }) {
  const mapped = HABIT_ICONS[icon] || HABIT_ICONS.checkin;
  const IconComponent = mapped.lib;
  return <IconComponent name={mapped.name} size={size} color={color} />;
}


export default function HabitCard({ habit, onToggle, style, onDragHandleLongPress, dragActive }) {
  const CheckboxWrapper = onToggle ? TouchableOpacity : View;

  return (
    <View style={[styles.habitCard, style]}>
      <View style={styles.habitRow}>
        <CheckboxWrapper
          style={[styles.checkbox, habit.doneToday && styles.checkboxChecked]}
          {...(onToggle ? { onPress: onToggle, activeOpacity: 0.7 } : {})}
        >
          {habit.doneToday && <Ionicons name="checkmark" size={13} color="white" />}
        </CheckboxWrapper>
        <View style={styles.habitIconWrap}>
          <HabitIcon icon={habit.icon} />
        </View>
        <View style={styles.habitInfo}>
          <Text style={[styles.habitName, habit.doneToday && styles.habitNameDone]}>{habit.name}</Text>
          <View style={styles.streakRow}>
            <Ionicons name="flame" size={12} color={habit.doneToday ? Colors.gold : Colors.inkFaint} />
            <Text style={[styles.streakText, habit.doneToday && styles.streakTextActive]}>
              {habit.streak} day streak
            </Text>
          </View>
        </View>
        {onDragHandleLongPress && (
          <GestureTouchableOpacity
            onLongPress={onDragHandleLongPress}
            delayLongPress={150}
            disabled={dragActive}
            activeOpacity={1}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="reorder-three-outline" size={22} color={Colors.inkFaint} />
          </GestureTouchableOpacity>
        )}
      </View>

      <View style={styles.habitDivider} />

      <View style={styles.weekStrip}>
        {habit.weekCompletion.map((done, i) => {
          const scheduled = habit.days.includes(DAY_ABBR[i]);
          return (
            <View key={i} style={[styles.weekDotWrap, !scheduled && styles.weekDotWrapMuted]}>
              <View style={[
                styles.weekDot,
                done && styles.weekDotFilled,
                i === TODAY_IDX && styles.weekDotToday,
              ]} />
              <Text style={styles.weekDotLabel}>{DAY_LETTERS[i]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  habitCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    ...Shadows.soft,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#cabfce',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  checkboxChecked: {
    backgroundColor: Colors.plum,
    borderColor: Colors.plum,
  },
  habitIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
  },
  habitNameDone: {
    color: Colors.inkFaint,
    textDecorationLine: 'line-through',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  streakText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.eyebrow,
    color: Colors.inkFaint,
  },
  streakTextActive: {
    color: Colors.gold,
  },
  habitDivider: {
    height: 1,
    backgroundColor: Colors.line,
    marginTop: 14,
    marginBottom: 12,
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 35,
  },
  weekDotWrap: {
    alignItems: 'center',
    gap: 5,
  },
  weekDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.line,
  },
  weekDotFilled: {
    backgroundColor: Colors.plum,
  },
  weekDotToday: {
    borderWidth: 1.5,
    borderColor: Colors.plum,
  },
  weekDotLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9.5,
    color: Colors.inkFaint,
  },
  weekDotWrapMuted: {
    opacity: 0.35,
  },
});
