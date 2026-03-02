import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const BAR_DATA = [
  { day: 'M', height: 45 },
  { day: 'T', height: 55 },
  { day: 'W', height: 40 },
  { day: 'T', height: 50 },
  { day: 'F', height: 65 },
  { day: 'S', height: 70 },
  { day: 'S', height: 35 },
];

export default function Progress() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
          {/* Header */}
          <View style={styles.headerRow}>
            <Ionicons name="chevron-back" size={26} color="white" />
            <Text style={styles.headerTitle}>Progress History</Text>
            <Ionicons name="share-outline" size={22} color="white" />
          </View>

          {/* Urges Defeated Count */}
          <View style={styles.countContainer}>
            <Text style={styles.countNumber}>7</Text>
            <Text style={styles.countLabel}>URGES DEFEATED</Text>
          </View>
        </View>

        {/* Urges Beat Card */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Urges Beat</Text>
            <View style={styles.thisWeekBadge}>
              <Text style={styles.thisWeekText}>This Week</Text>
            </View>
          </View>

          {/* Bar Chart */}
          <View style={styles.chartContainer}>
            {BAR_DATA.map((bar, i) => (
              <View key={i} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View style={[
                    styles.bar,
                    { height: bar.height },
                    i === 5 && styles.barHighlight,
                  ]} />
                </View>
                <Text style={[
                  styles.barLabel,
                  i === 5 && styles.barLabelHighlight,
                ]}>{bar.day}</Text>
              </View>
            ))}
          </View>

        </View>

        {/* Recovery Milestones */}
        <Text style={styles.sectionTitle}>Recovery Milestones</Text>

        {/* 1 Urge - Achieved */}
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneIconCircle}>
            <MaterialCommunityIcons name="trophy" size={22} color="white" />
          </View>
          <View style={styles.milestoneInfo}>
            <Text style={styles.milestoneName}>1 Urge Defeated</Text>
            <Text style={styles.milestoneSubtext}>Achieved Nov 15</Text>
          </View>
          <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
        </View>

        {/* 5 Urges - Achieved */}
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneIconCircle}>
            <MaterialCommunityIcons name="trophy" size={22} color="white" />
          </View>
          <View style={styles.milestoneInfo}>
            <Text style={styles.milestoneName}>5 Urges Defeated</Text>
            <Text style={styles.milestoneSubtext}>Achieved Nov 18</Text>
          </View>
          <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
        </View>

        {/* 10 Urges - In Progress */}
        <View style={styles.milestoneCard}>
          <View style={[styles.milestoneIconCircle, styles.milestoneIconGray]}>
            <MaterialCommunityIcons name="lock-outline" size={22} color="#999" />
          </View>
          <View style={styles.milestoneInfo}>
            <Text style={styles.milestoneName}>10 Urges Defeated</Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarTrack}>
                <View style={styles.progressBarFill} />
              </View>
            </View>
          </View>
          <Text style={styles.milestoneDays}>7/10 Urges</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="trophy" size={28} color="#7B1FA2" />
            <Text style={styles.statValue}>$120</Text>
            <Text style={styles.statLabel}>MONEY SAVED</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="heart" size={28} color="#E91E63" />
            <Text style={styles.statValue}>48h</Text>
            <Text style={styles.statLabel}>TIME GAINED</Text>
          </View>
        </View>

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
        <View style={styles.tabItem}>
          <Ionicons name="bar-chart" size={24} color="#7B1FA2" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Progress</Text>
        </View>
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
    paddingBottom: 36,
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },

  /* Urges Defeated Count */
  countContainer: {
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  countNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  countLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 2,
    marginTop: -4,
    textAlign: 'center',
  },

  /* Card */
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  thisWeekBadge: {
    borderWidth: 1,
    borderColor: '#7B1FA2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  thisWeekText: {
    fontSize: 12,
    color: '#7B1FA2',
    fontWeight: '500',
  },

  /* Bar Chart */
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 90,
    marginBottom: 12,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 24,
    borderRadius: 4,
    backgroundColor: '#CE93D8',
  },
  barHighlight: {
    backgroundColor: '#7B1FA2',
  },
  barLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  barLabelHighlight: {
    color: '#7B1FA2',
    fontWeight: '600',
  },
  /* Section Title */
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
  },

  /* Milestone Cards */
  milestoneCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  milestoneIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  milestoneIconGray: {
    backgroundColor: '#e0e0e0',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  milestoneSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  milestoneDays: {
    fontSize: 12,
    color: '#7B1FA2',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginTop: 6,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#ece3f0',
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    width: '70%',
    backgroundColor: '#7B1FA2',
    borderRadius: 3,
  },

  /* Stats Row */
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 1,
    marginTop: 4,
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
