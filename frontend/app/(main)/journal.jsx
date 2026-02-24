import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

const FILTERS = ['All Entries', 'Reflections', 'Victories', 'Struggles'];

const ENTRIES = [
  {
    dateLabel: 'TODAY, NOV 23',
    title: 'Staying strong through the holiday prep',
    preview: 'Felt a bit overwhelmed with the family dinner planning, but I practiced my deep breathing...',
    tag: 'VICTORY',
    tagColor: '#4CAF50',
    tagBg: '#e8f5e9',
    time: '10:45 AM',
  },
  {
    dateLabel: 'YESTERDAY, NOV 22',
    title: 'Evening reflection',
    preview: "Grateful for the support group today. Hearing others' stories reminded me that I'm not...",
    tag: 'REFLECTION',
    tagColor: '#7B1FA2',
    tagBg: '#ede7f6',
    time: '9:15 PM',
  },
  {
    dateLabel: 'WEDNESDAY, NOV 21',
    title: 'Difficult afternoon',
    preview: 'Struggled around 3 PM when work got stressful. I used the SOS button and called...',
    tag: 'STRUGGLE',
    tagColor: '#E65100',
    tagBg: '#fff3e0',
    time: '3:42 PM',
  },
];

export default function Journal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All Entries');

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
        <TouchableOpacity style={styles.newEntryBtn}>
          <Ionicons name="add-circle-outline" size={22} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.newEntryText}>New Reflection</Text>
        </TouchableOpacity>

        {/* Journal Entries */}
        {ENTRIES.map((entry, i) => (
          <View key={i} style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryDate}>{entry.dateLabel}</Text>
              <TouchableOpacity>
                <Text style={styles.entryMore}>•••</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.entryTitle}>{entry.title}</Text>
            <Text style={styles.entryPreview}>{entry.preview}</Text>
            <View style={styles.entryFooter}>
              <View style={[styles.tagBadge, { backgroundColor: entry.tagBg }]}>
                <Text style={[styles.tagText, { color: entry.tagColor }]}>{entry.tag}</Text>
              </View>
              <Text style={styles.entryTime}>{entry.time}</Text>
            </View>
          </View>
        ))}

        {/* Bottom spacer */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* SOS Button */}
      <TouchableOpacity style={styles.sosButton} onPress={() => router.push('/panic')}>
        <MaterialCommunityIcons name="lifebuoy" size={26} color="white" />
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>

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
