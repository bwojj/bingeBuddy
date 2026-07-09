import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Pressable, Animated, Dimensions, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useRef } from 'react';
import { addEntry, getEntries, deleteEntry } from "../../components/JournalAPI";
import TabBar from '../components/TabBar';
import SOSButton from '../components/SOSButton';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

function useSheetAnimation(visible) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 14,
      }).start();
    } else {
      translateY.setValue(SCREEN_HEIGHT);
    }
  }, [visible, translateY]);

  return translateY;
}

const TAG_STYLES = {
  Victory:    { color: Colors.sage, bg: Colors.sageTint },
  Reflection: { color: Colors.plum, bg: Colors.plumTint },
  Struggle:   { color: Colors.amber, bg: Colors.amberTint },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const FILTERS = ['All Entries', 'Reflections', 'Victories', 'Struggles'];

export default function Journal() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All Entries');
  const [modalVisible, setModalVisible] = useState(false);
  const [entryType, setEntryType] = useState('Reflection');
  const [entryTitle, setEntryTitle] = useState('');
  const [entryBody, setEntryBody] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  const newEntrySlide = useSheetAnimation(modalVisible);
  const actionSlide = useSheetAnimation(actionMenuVisible);
  const viewSlide = useSheetAnimation(viewModalVisible);

  async function fetchEntries() {
    setLoading(true);
    const data = await getEntries();
    if (data) setEntries(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  function openActionMenu(entry) {
    setSelectedEntry(entry);
    setActionMenuVisible(true);
  }

  function openViewEntry(entry) {
    setActionMenuVisible(false);
    setViewEntry(entry);
    setViewModalVisible(true);
  }

  function handleDelete(entry) {
    const doDelete = async () => {
      const ok = await deleteEntry(entry.id);
      if (ok) {
        setActionMenuVisible(false);
        await fetchEntries();
      }
    };
    doDelete();
  }

  function openModal() {
    setEntryType('Reflection');
    setEntryTitle('');
    setEntryBody('');
    setModalVisible(true);
  }

  function handleSave() {
    const saveEntry = async () => {
      const ok = await addEntry(entryType, entryTitle, entryBody);
      if (ok) {
        await fetchEntries();
        setModalVisible(false);
      } else {
        console.log('Failed to add');
      }
    };
    saveEntry();
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overscroll fix: fills iOS bounce area with plum */}
        <View style={styles.overscrollFill} />

        {/* Plum gradient header - scrolls with content */}
        <LinearGradient
          colors={Gradients.hero.colors}
          start={Gradients.hero.start}
          end={Gradients.hero.end}
          style={[styles.headerBg, { paddingTop: insets.top + 10 }]}
        >
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Recovery Journal</Text>
            <TouchableOpacity style={styles.searchBtn}>
              <Ionicons name="search" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>

        {/* New Entry Button */}
        <TouchableOpacity style={styles.newEntryBtn} onPress={openModal}>
          <Ionicons name="add-circle-outline" size={22} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.newEntryText}>New Reflection</Text>
        </TouchableOpacity>

        {/* Journal Entries */}
        {loading ? (
          <ActivityIndicator size="large" color={Colors.plum} style={{ marginTop: 40 }} />
        ) : (
          entries
            .filter((entry) => {
              if (activeFilter === 'All Entries') return true;
              if (activeFilter === 'Reflections') return entry.entry_type === 'Reflection';
              if (activeFilter === 'Victories') return entry.entry_type === 'Victory';
              if (activeFilter === 'Struggles') return entry.entry_type === 'Struggle';
              return true;
            })
            .map((entry) => {
              const tag = TAG_STYLES[entry.entry_type] || TAG_STYLES.Reflection;
              return (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>{formatDate(entry.created_at)}</Text>
                    <TouchableOpacity onPress={() => openActionMenu(entry)}>
                      <Text style={styles.entryMore}>•••</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                  <Text style={styles.entryPreview}>{entry.entry}</Text>
                  <View style={styles.entryFooter}>
                    <View style={[styles.tagBadge, { backgroundColor: tag.bg }]}>
                      <Text style={[styles.tagText, { color: tag.color }]}>{entry.entry_type.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.entryTime}>{formatTime(entry.created_at)}</Text>
                  </View>
                </View>
              );
            })
        )}

        {/* Bottom spacer */}
        <View style={{ height: 90 }} />
      </ScrollView>

      <SOSButton />

      {/* New Entry Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setModalVisible(false)} />
          <Animated.View style={[styles.modalSheet, { paddingBottom: insets.bottom + 20, transform: [{ translateY: newEntrySlide }] }]}>
            {/* Handle */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Journal Entry</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.inkSoft} />
              </TouchableOpacity>
            </View>

            {/* Type Selector */}
            <Text style={styles.modalLabel}>Type</Text>
            <View style={styles.typeRow}>
              {['Reflection', 'Victory', 'Struggle'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, entryType === type && styles.typeChipActive]}
                  onPress={() => setEntryType(type)}
                >
                  <Text style={[styles.typeChipText, entryType === type && styles.typeChipTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Title */}
            <Text style={styles.modalLabel}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Give your entry a title..."
              placeholderTextColor={Colors.inkFaint}
              value={entryTitle}
              onChangeText={setEntryTitle}
              returnKeyType="next"
            />

            {/* Body */}
            <Text style={styles.modalLabel}>Entry</Text>
            <TextInput
              style={styles.bodyInput}
              placeholder="Write your thoughts here..."
              placeholderTextColor={Colors.inkFaint}
              value={entryBody}
              onChangeText={setEntryBody}
              multiline
              textAlignVertical="top"
            />

            {/* Save */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Entry</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Action Menu Modal */}
      <Modal
        visible={actionMenuVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setActionMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setActionMenuVisible(false)}>
          <Animated.View style={[styles.actionSheet, { paddingBottom: insets.bottom + 12, transform: [{ translateY: actionSlide }] }]}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.actionRow} onPress={() => openViewEntry(selectedEntry)}>
              <Ionicons name="eye-outline" size={22} color={Colors.ink} />
              <Text style={styles.actionRowText}>View Full Entry</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity style={styles.actionRow} onPress={() => handleDelete(selectedEntry)}>
              <Ionicons name="trash-outline" size={22} color={Colors.alert} />
              <Text style={[styles.actionRowText, { color: Colors.alert }]}>Delete Entry</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* View Full Entry Modal */}
      <Modal
        visible={viewModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setViewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setViewModalVisible(false)} />
          <Animated.View style={[styles.viewSheet, { paddingBottom: insets.bottom + 20, transform: [{ translateY: viewSlide }] }]}>
            <View style={styles.modalHandle} />
            {viewEntry && (() => {
              const tag = TAG_STYLES[viewEntry.entry_type] || TAG_STYLES.Reflection;
              return (
                <>
                  <View style={styles.modalHeader}>
                    <View style={[styles.tagBadge, { backgroundColor: tag.bg }]}>
                      <Text style={[styles.tagText, { color: tag.color }]}>{viewEntry.entry_type.toUpperCase()}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                      <Ionicons name="close" size={24} color={Colors.inkSoft} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.viewDate}>{formatDate(viewEntry.created_at)} · {formatTime(viewEntry.created_at)}</Text>
                  <Text style={styles.viewTitle}>{viewEntry.title}</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.viewBody}>{viewEntry.entry}</Text>
                  </ScrollView>
                </>
              );
            })()}
          </Animated.View>
        </View>
      </Modal>

      <TabBar activeTab="journal" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  overscrollFill: {
    position: 'absolute',
    top: -1000,
    left: 0,
    right: 0,
    height: 1000,
    backgroundColor: Colors.plumDeep,
  },
  headerBg: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerTitle: {
    fontFamily: FontFamily.serifMedium,
    fontSize: 24,
    color: 'white',
  },
  searchBtn: {
    padding: 4,
  },

  /* Filter Chips */
  filterScroll: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: Radii.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  filterChipActive: {
    backgroundColor: 'white',
  },
  filterChipText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondarySm,
    color: 'rgba(255,255,255,0.9)',
  },
  filterChipTextActive: {
    color: Colors.plum,
  },

  /* New Entry Button */
  newEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '90%',
    paddingVertical: 16,
    borderRadius: Radii.btn,
    backgroundColor: Colors.plumDeep,
    marginTop: 18,
    marginBottom: 20,
    ...Shadows.pop,
  },
  newEntryText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
    color: 'white',
    letterSpacing: 0.3,
  },

  /* Entry Cards */
  entryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    ...Shadows.soft,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  entryDate: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
    letterSpacing: 0.6,
  },
  entryMore: {
    fontSize: 14,
    color: Colors.inkFaint,
    letterSpacing: 1,
  },
  entryTitle: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.jentryTitle,
    color: Colors.ink,
    marginBottom: 6,
  },
  entryPreview: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
    lineHeight: 19,
    marginBottom: 12,
  },
  entryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    letterSpacing: 0.5,
  },
  entryTime: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.eyebrow,
    color: Colors.inkFaint,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(37,24,38,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.line,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    marginTop: 4,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.bg,
    alignItems: 'center',
  },
  typeChipActive: {
    backgroundColor: Colors.plum,
  },
  typeChipText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondarySm,
    color: Colors.plum,
  },
  typeChipTextActive: {
    color: 'white',
  },
  titleInput: {
    backgroundColor: Colors.plumTint2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.body,
    color: Colors.ink,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  bodyInput: {
    backgroundColor: Colors.plumTint2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.body,
    color: Colors.ink,
    height: 130,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  saveBtn: {
    backgroundColor: Colors.plum,
    borderRadius: Radii.btn,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadows.pop,
  },
  saveBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
    color: 'white',
  },

  /* Action Sheet */
  actionSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 14,
  },
  actionRowText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.body,
    color: Colors.ink,
  },
  actionDivider: {
    height: 1,
    backgroundColor: Colors.line,
  },

  /* View Full Modal */
  viewSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '80%',
  },
  viewDate: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.eyebrow,
    color: Colors.inkFaint,
    marginBottom: 10,
    marginTop: 4,
  },
  viewTitle: {
    fontFamily: FontFamily.serifMedium,
    fontSize: 22,
    color: Colors.ink,
    marginBottom: 14,
  },
  viewBody: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.body,
    color: Colors.inkSoft,
    lineHeight: 24,
  },
});
