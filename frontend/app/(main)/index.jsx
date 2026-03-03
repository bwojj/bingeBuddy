import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HomeQuoteBox from '../components/HomeQuoteBox';
import HomeMotivation from '../components/HomeMotivation';
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from '@/components/LoadingScreen';
import { getEntries } from '@/components/JournalAPI';

export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [lastEntry, setLastEntry] = useState(null);

  const { userCredentials, userPreferences, userLoading, urgeCount, refreshUserData } = useAuth();

  useFocusEffect(
    useCallback(() => {
      refreshUserData();
      getEntries().then(data => {
        if (data?.length) {
          const sorted = [...data].sort((a, b) => b.id - a.id);
          setLastEntry(sorted[0]);
        } else {
          setLastEntry(null);
        }
      });
    }, [refreshUserData])
  );

  if (userLoading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/*
          Overscroll fix: on iOS, pulling past the top bounces and reveals bare
          background. This purple block sits 1000px above the content so that
          bounce area is always purple.
        */}
        <View style={styles.overscrollFill} />

        {/* Purple header - scrolls with content */}
        <View style={[styles.headerBg, { paddingTop: insets.top + 15 }]}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Good Morning, {userCredentials?.first_name}!</Text>
            <Text style={styles.date}>Thursday, Nov 20</Text>
          </View>
        </View>

        {/* Quote Card - overlaps bottom of purple header */}
        <View style={styles.quoteWrapper}>
          <HomeQuoteBox />
        </View>

        {/* Motivation Section */}
        <Text style={styles.sectionTitle}>Motivation</Text>
        <HomeMotivation userPreferences={userPreferences}/>

        {/* Progress Snapshot Card */}
        <TouchableOpacity style={styles.progressCard} onPress={() => router.push('/progress')} activeOpacity={0.85}>
          <Text style={styles.progressTitle}>Progress Snapshot</Text>
          <View style={styles.urgeCountRow}>
            <MaterialCommunityIcons name="trophy" size={38} color="#7B1FA2" />
            <Text style={styles.urgeCountBig}>{urgeCount}</Text>
          </View>
          <Text style={styles.urgeCountLabel}>URGES DEFEATED</Text>
          <Text style={styles.progressSubtext}>Keep going — every urge beaten counts.</Text>
        </TouchableOpacity>

        {/* Latest Journal Entry */}
        <Text style={[styles.sectionTitle, { marginHorizontal: 24 }]}>Latest Journal Entry</Text>
        <TouchableOpacity style={styles.journalCard} onPress={() => router.push('/journal')} activeOpacity={0.85}>
          {lastEntry ? (
            <>
              <View style={styles.journalCardHeader}>
                <Text style={styles.journalEntryTitle} numberOfLines={1}>{lastEntry.title}</Text>
                <View style={styles.journalTypeBadge}>
                  <Text style={styles.journalTypeText}>{lastEntry.entry_type}</Text>
                </View>
              </View>
              <Text style={styles.journalEntrySnippet} numberOfLines={3}>{lastEntry.entry}</Text>
            </>
          ) : (
            <View style={styles.journalEmptyRow}>
              <Ionicons name="document-text-outline" size={22} color="#bbb" />
              <Text style={styles.journalEmptyText}>No entries yet — write your first one.</Text>
            </View>
          )}
          <Text style={styles.journalLink}>View Journal →</Text>
        </TouchableOpacity>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* SOS Button - fixed above tab bar */}
      <TouchableOpacity style={styles.sosButton} onPress={() => router.push('/panic')}>
        <MaterialCommunityIcons name="lifebuoy" size={26} color="white" />
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>

      {/* Bottom Tab Bar */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom || 10 }]}>
        <View style={styles.tabItem}>
          <Ionicons name="home" size={24} color="#7B1FA2" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/progress')}>
          <Ionicons name="bar-chart-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/journal')}>
          <Ionicons name="document-text-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>Journal</Text>
        </TouchableOpacity>
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
  /* Fills the iOS overscroll bounce area at the top with purple */
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 68,
  },
  quoteWrapper: {
    marginTop: -48,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  greetingContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  date: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },

  /* Progress Snapshot */
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  urgeCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  urgeCountBig: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#7B1FA2',
  },
  urgeCountLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7B1FA2',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  progressSubtext: {
    fontSize: 13,
    color: '#888',
  },
  /* Journal Card */
  journalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 24,
    marginTop: 0,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  journalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  journalEntryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  journalTypeBadge: {
    backgroundColor: '#ede7f6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  journalTypeText: {
    fontSize: 11,
    color: '#7B1FA2',
    fontWeight: '600',
  },
  journalEntrySnippet: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
    marginBottom: 12,
  },
  journalEmptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  journalEmptyText: {
    fontSize: 13,
    color: '#bbb',
  },
  journalLink: {
    fontSize: 13,
    color: '#7B1FA2',
    fontWeight: '600',
  },

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
