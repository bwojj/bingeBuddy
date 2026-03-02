import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { addEntry, getEntries, deleteEntry } from "../../components/JournalAPI";

const TAG_STYLES = {
  Victory:    { color: '#4CAF50', bg: '#e8f5e9' },
  Reflection: { color: '#7B1FA2', bg: '#ede7f6' },
  Struggle:   { color: '#E65100', bg: '#fff3e0' },
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
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All Entries');
  const [modalVisible, setModalVisible] = useState(false);
  const [entryType, setEntryType] = useState('Reflection');
  const [entryTitle, setEntryTitle] = useState('');
  const [entryBody, setEntryBody] = useState('');
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  async function fetchEntries() {
    const data = await getEntries();
    if (data) setEntries(data);
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
        {/* Overscroll fix: fills iOS bounce area with purple */}
        <View style={styles.overscrollFill} />

        {/* Purple header - scrolls with content */}
        <View style={[styles.headerBg, { paddingTop: insets.top + 10 }]}>
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
        </View>

        {/* New Entry Button */}
        <TouchableOpacity style={styles.newEntryBtn} onPress={openModal}>
          <Ionicons name="add-circle-outline" size={22} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.newEntryText}>New Reflection</Text>
        </TouchableOpacity>

        {/* Journal Entries */}
        {entries.map((entry) => {
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
        })}

        {/* Bottom spacer */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* SOS Button */}
      <TouchableOpacity style={styles.sosButton} onPress={() => router.push('/panic')}>
        <MaterialCommunityIcons name="lifebuoy" size={26} color="white" />
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>

      {/* New Entry Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setModalVisible(false)} />
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 20 }]}>
            {/* Handle */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Journal Entry</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#555" />
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
              placeholderTextColor="#bbb"
              value={entryTitle}
              onChangeText={setEntryTitle}
              returnKeyType="next"
            />

            {/* Body */}
            <Text style={styles.modalLabel}>Entry</Text>
            <TextInput
              style={styles.bodyInput}
              placeholder="Write your thoughts here..."
              placeholderTextColor="#bbb"
              value={entryBody}
              onChangeText={setEntryBody}
              multiline
              textAlignVertical="top"
            />

            {/* Save */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Action Menu Modal */}
      <Modal
        visible={actionMenuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActionMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setActionMenuVisible(false)}>
          <View style={[styles.actionSheet, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.actionRow} onPress={() => openViewEntry(selectedEntry)}>
              <Ionicons name="eye-outline" size={22} color="#333" />
              <Text style={styles.actionRowText}>View Full Entry</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity style={styles.actionRow} onPress={() => handleDelete(selectedEntry)}>
              <Ionicons name="trash-outline" size={22} color="#C62828" />
              <Text style={[styles.actionRowText, { color: '#C62828' }]}>Delete Entry</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* View Full Entry Modal */}
      <Modal
        visible={viewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setViewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setViewModalVisible(false)} />
          <View style={[styles.viewSheet, { paddingBottom: insets.bottom + 20 }]}>
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
                      <Ionicons name="close" size={24} color="#555" />
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
          </View>
        </View>
      </Modal>

      {/* Bottom Tab Bar */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom || 10 }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/')}>
          <Ionicons name="home-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/progress')}>
          <Ionicons name="bar-chart-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/coach')}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>AI Coach</Text>
        </TouchableOpacity>
        <View style={styles.tabItem}>
          <Ionicons name="document-text" size={24} color="#7B1FA2" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Journal</Text>
        </View>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3edf7',
  },
  overscrollFill: {
    position: 'absolute',
    top: -1000,
    left: 0,
    right: 0,
    height: 1000,
    backgroundColor: '#7B1FA2',
  },
  headerBg: {
    backgroundColor: '#7B1FA2',
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
    fontSize: 24,
    fontWeight: 'bold',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterChipActive: {
    backgroundColor: 'white',
  },
  filterChipText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#7B1FA2',
    fontWeight: '600',
  },

  /* New Entry Button */
  newEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '90%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#6A1B9A',
    marginTop: 18,
    marginBottom: 20,
    shadowColor: '#6A1B9A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  newEntryText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },

  /* Entry Cards */
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  entryDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 0.5,
  },
  entryMore: {
    fontSize: 14,
    color: '#bbb',
    letterSpacing: 1,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  entryPreview: {
    fontSize: 13,
    color: '#666',
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  entryTime: {
    fontSize: 12,
    color: '#aaa',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777',
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
    backgroundColor: '#f3edf7',
    alignItems: 'center',
  },
  typeChipActive: {
    backgroundColor: '#7B1FA2',
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7B1FA2',
  },
  typeChipTextActive: {
    color: 'white',
  },
  titleInput: {
    backgroundColor: '#f9f5fc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ede7f6',
  },
  bodyInput: {
    backgroundColor: '#f9f5fc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
    height: 130,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ede7f6',
  },
  saveBtn: {
    backgroundColor: '#7B1FA2',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#7B1FA2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },

  /* Action Sheet */
  actionSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },

  /* View Full Modal */
  viewSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '80%',
  },
  viewDate: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    marginBottom: 10,
    marginTop: 4,
  },
  viewTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 14,
  },
  viewBody: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
  },

  /* SOS Button */
  sosButton: {
    position: 'absolute',
    right: 10,
    bottom: 95,
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#C62828',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  sosText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 1,
  },

  /* Bottom Tab Bar */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#7B1FA2',
  },
});
