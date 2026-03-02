import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HomeQuoteBox from '../components/HomeQuoteBox';
import HomeMotivation from '../components/HomeMotivation';
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { userCredentials, userPreferences, userLoading, refreshUserData } = useAuth();

  useFocusEffect(
    useCallback(() => {
      refreshUserData();
    }, [refreshUserData])
  );

  if (userLoading) return null;

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
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Progress Snapshot</Text>
          <View style={styles.ringContainer}>
            <View style={styles.ringTrack} />
            <View style={styles.ringFill} />
            <View style={styles.ringCenter}>
              <Text style={styles.ringLabel}>Recovery Rate:</Text>
              <Text style={styles.ringPercent}>90%</Text>
            </View>
          </View>
          <Text style={styles.progressSubtext}>{"You've defeated 12 urges and counting!"}</Text>
        </View>

        {/* Quick Actions Section */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsWrapper}>
          <View style={styles.quickActionsRow}>
            <View style={[styles.quickActionBtn, styles.quickActionPrimary]}>
              <Ionicons name="chatbubble-ellipses" size={26} color="white" />
            </View>
            <View style={[styles.quickActionBtn, styles.quickActionSecondary]}>
              <Ionicons name="create-outline" size={26} color="#7B1FA2" />
            </View>
            <View style={[styles.quickActionBtn, styles.quickActionSecondary]}>
              <MaterialCommunityIcons name="dice-multiple-outline" size={26} color="#7B1FA2" />
            </View>
            <View style={[styles.quickActionBtn, styles.quickActionSecondary]}>
              <Ionicons name="grid-outline" size={26} color="#7B1FA2" />
            </View>
          </View>
        </View>

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
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/coach')}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>AI Coach</Text>
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
  ringContainer: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  ringTrack: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 10,
    borderColor: '#ece3f0',
  },
  ringFill: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 10,
    borderColor: '#7B1FA2',
    borderTopColor: '#ece3f0',
    transform: [{ rotate: '-20deg' }],
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    fontSize: 11,
    color: '#666',
  },
  ringPercent: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#333',
  },
  progressSubtext: {
    fontSize: 14,
    color: '#555',
  },

  /* Quick Actions */
  quickActionsWrapper: {
    marginHorizontal: 20,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    height: 68,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionPrimary: {
    backgroundColor: '#7B1FA2',
  },
  quickActionSecondary: {
    backgroundColor: '#f0e6f6',
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
