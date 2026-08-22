import { Text, View, StyleSheet, TouchableOpacity, Modal, TextInput, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { usePostHog } from 'posthog-react-native';
import TabBar from '../components/TabBar';
import ConsistencyCard from '../components/ConsistencyCard';
import HabitCard, { HabitIcon } from '../components/HabitCard';
import { getHabits, getPlanStreak, toggleHabitDone, addCustomHabit, deleteHabit, resetHabits, reorderHabits } from '@/components/HabitAPI';
import LoadingScreen from '@/components/LoadingScreen';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients, Spacing } from '@/constants/theme';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];


const OVERSCROLL_BUFFER = 1000;

const ICON_CHOICES = [
  'custom', 'water', 'sleep', 'walk', 'nutrition', 'gratitude', 'creative', 'social',
  'music', 'reading', 'yoga', 'sunlight', 'writing', 'cooking', 'finance', 'work',
  'screentime', 'pets', 'plant', 'goal', 'breathing', 'coffee',
];

export default function MyPlan() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const posthog = usePostHog();
  const [headerContentHeight, setHeaderContentHeight] = useState(160);
  const mergedHeight = OVERSCROLL_BUFFER + headerContentHeight;
  const mergedGradientStart = {
    x: Gradients.hero.start.x,
    y: (OVERSCROLL_BUFFER + Gradients.hero.start.y * headerContentHeight) / mergedHeight,
  };
  const mergedGradientEnd = {
    x: Gradients.hero.end.x,
    y: (OVERSCROLL_BUFFER + Gradients.hero.end.y * headerContentHeight) / mergedHeight,
  };
  const [habits, setHabits] = useState([]);
  const [planStreakData, setPlanStreakData] = useState({ streak: 0, bestStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState('custom');
  const [saving, setSaving] = useState(false);
  const [draggingId, setDraggingId] = useState(null);

  const fetchAll = useCallback(async () => {
    const h = await getHabits();
    setHabits(h);
    setPlanStreakData(getPlanStreak());
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  async function handleToggle(id) {
    const updated = await toggleHabitDone(id);
    if (updated) {
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
      setPlanStreakData(getPlanStreak());
      if (updated.doneToday) {
        posthog?.capture('habit_completed', { habit_name: updated.name });
      }
    }
  }

  async function handleDeleteHabit(name) {
    const ok = await deleteHabit(name);
    if (ok) {
      await fetchAll();
    }
  }

  function confirmDeleteHabit(name) {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteHabit(name) },
      ]
    );
  }

  function handleDragEnd({ data }) {
    setHabits(data);
    reorderHabits(data.map((h) => h.name));
  }

  function renderHabitItem({ item, drag }) {
    const isDragging = draggingId === item.id;
    return (
      <Swipeable
        containerStyle={styles.swipeableRow}
        renderRightActions={() => (
          <TouchableOpacity
            style={styles.deleteAction}
            onPress={() => confirmDeleteHabit(item.name)}
            activeOpacity={0.8}
          >
            <View style={styles.deleteActionBg} />
            <Ionicons name="trash-outline" size={22} color="white" />
          </TouchableOpacity>
        )}
      >
        <HabitCard
          habit={item}
          onToggle={() => handleToggle(item.id)}
          style={styles.swipeableCard}
          onDragHandleLongPress={drag}
          dragActive={isDragging}
        />
      </Swipeable>
    );
  }

  function handleResetHabits() {
    Alert.alert(
      'Reset Habits',
      'This will remove any custom habits and restore the default set. This can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const ok = await resetHabits();
            if (ok) {
              setLoading(true);
              await fetchAll();
            } else {
              Alert.alert('Something went wrong', "Couldn't reset your habits. Please check your connection and try again.");
            }
          },
        },
      ]
    );
  }

  function openAddModal() {
    setNewHabitName('');
    setSelectedDays([]);
    setSelectedIcon('custom');
    setAddModalVisible(true);
  }

  function toggleDay(day) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  const canSaveHabit = newHabitName.trim().length > 0 && selectedDays.length > 0 && !saving;

  async function handleAddHabit() {
    if (!canSaveHabit) return;
    setSaving(true);
    const ok = await addCustomHabit(newHabitName.trim(), selectedDays, selectedIcon);
    setSaving(false);
    if (ok) {
      setAddModalVisible(false);
      await fetchAll();
    }
  }

  const doneCount = habits.filter((h) => h.doneToday).length;
  const planStreak = planStreakData.streak;
  const planBestStreak = planStreakData.bestStreak;

  if (loading) return <LoadingScreen />;

  const listHeader = (
    <>
      <View style={styles.headerWrap}>
        <LinearGradient
          colors={Gradients.hero.colors}
          start={mergedGradientStart}
          end={mergedGradientEnd}
          style={[styles.headerBgGradient, { top: -OVERSCROLL_BUFFER, height: mergedHeight }]}
        />
        <View
          onLayout={(e) => setHeaderContentHeight(e.nativeEvent.layout.height)}
          style={[styles.headerBg, { paddingTop: insets.top + 15 }]}
        >
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroTitle}>My Recovery</Text>
              <Text style={styles.heroSub}>{doneCount} of {habits.length} habits done today</Text>
            </View>
            <TouchableOpacity
              style={styles.heroIconWrap}
              onPress={() => router.push('/notification-settings')}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Habit Streak */}
      <ConsistencyCard mode="streak" dayStreak={planStreak} bestStreak={planBestStreak} />

      <View style={styles.urgeActionsRow}>
        <TouchableOpacity
          style={styles.viewAllDaysBtn}
          onPress={() => router.push({ pathname: '/all-days', params: { streak: planStreak } })}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={15} color={Colors.plum} />
          <Text style={styles.viewAllDaysBtnText}>View All Days</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Habits */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { marginHorizontal: 0, marginTop: 0, marginBottom: 0 }]}>
          Today&apos;s Habits
        </Text>
        <TouchableOpacity onPress={handleResetHabits} activeOpacity={0.6}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const listFooter = (
    <>
      {/* Add a Habit */}
      <TouchableOpacity style={styles.addHabitBtn} onPress={openAddModal} activeOpacity={0.7}>
        <Ionicons name="add-circle-outline" size={20} color={Colors.plum} />
        <Text style={styles.addHabitBtnText}>Add a Habit</Text>
      </TouchableOpacity>

      <View style={{ height: 90 }} />
    </>
  );

  return (
    <View style={styles.container}>
      <DraggableFlatList
        containerStyle={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabitItem}
        onDragBegin={(index) => setDraggingId(habits[index]?.id ?? null)}
        onRelease={() => setDraggingId(null)}
        onDragEnd={handleDragEnd}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
      />

      <TabBar activeTab="my-plan" />

      {/* Add Habit modal */}
      <Modal
        visible={addModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAddModalVisible(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add a Habit</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.inkSoft} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Habit name</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="e.g. Evening walk"
              placeholderTextColor={Colors.inkFaint}
              value={newHabitName}
              onChangeText={setNewHabitName}
              returnKeyType="done"
            />

            <Text style={styles.modalLabel}>Repeat on</Text>
            <View style={styles.dayPickerRow}>
              {DAY_ABBR.map((day, i) => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayChip, selectedDays.includes(day) && styles.dayChipActive]}
                  onPress={() => toggleDay(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayChipText, selectedDays.includes(day) && styles.dayChipTextActive]}>
                    {DAY_LETTERS[i]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Icon</Text>
            <View style={styles.iconPickerRow}>
              {ICON_CHOICES.map((iconKey) => {
                const isSelected = selectedIcon === iconKey;
                return (
                  <TouchableOpacity
                    key={iconKey}
                    style={[styles.iconChip, isSelected && styles.iconChipActive]}
                    onPress={() => setSelectedIcon(iconKey)}
                    activeOpacity={0.7}
                  >
                    <HabitIcon icon={iconKey} size={20} color={isSelected ? 'white' : Colors.plum} />
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.saveHabitBtn, !canSaveHabit && styles.saveHabitBtnDisabled]}
              onPress={handleAddHabit}
              disabled={!canSaveHabit}
              activeOpacity={0.85}
            >
              <Text style={styles.saveHabitBtnText}>{saving ? 'Adding…' : 'Add Habit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  headerWrap: {
    position: 'relative',
  },
  headerBgGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerBg: {
    paddingBottom: 26,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenH,
  },
  heroTitle: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.heroTitle,
    color: 'white',
  },
  heroSub: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.secondary,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 5,
  },
  heroIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* View All Days */
  urgeActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  viewAllDaysBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.plum,
    backgroundColor: Colors.plumTint,
  },
  viewAllDaysBtnText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.eyebrow,
    color: Colors.plum,
  },

  /* Section header row (title + subtle reset link) */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  resetText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
  },

  /* Section title */
  sectionTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: Colors.inkFaint,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  swipeableRow: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  swipeableCard: {
    marginHorizontal: 0,
    marginBottom: 0,
  },
  deleteAction: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionBg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -20,
    right: 0,
    backgroundColor: Colors.alert,
    borderTopRightRadius: Radii.card,
    borderBottomRightRadius: Radii.card,
  },

  /* Add a Habit */
  addHabitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: Radii.btn,
    borderWidth: 1.5,
    borderColor: Colors.plumTint,
  },
  addHabitBtnText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondary,
    color: Colors.plum,
  },

  /* Add Habit modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(37,24,38,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.topbarTitle,
    color: Colors.ink,
  },
  modalLabel: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondary,
    color: Colors.inkSoft,
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: Colors.plumTint2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.body,
    color: Colors.ink,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  dayPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  dayChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: Colors.surface,
  },
  dayChipActive: {
    backgroundColor: Colors.plum,
    borderColor: Colors.plum,
  },
  dayChipText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
  },
  dayChipTextActive: {
    color: 'white',
  },
  iconPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: Colors.surface,
  },
  iconChipActive: {
    backgroundColor: Colors.plum,
    borderColor: Colors.plum,
  },
  saveHabitBtn: {
    backgroundColor: Colors.plum,
    borderRadius: Radii.btn,
    paddingVertical: 15,
    alignItems: 'center',
    ...Shadows.pop,
  },
  saveHabitBtnDisabled: {
    backgroundColor: Colors.plumSoft,
    ...Shadows.soft,
  },
  saveHabitBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
    color: 'white',
  },
});
