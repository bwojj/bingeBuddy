import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from "@/context/AuthContext";

// Mon=0 ... Sun=6
const TODAY_IDX = (new Date().getDay() + 6) % 7;

const EMPTY_BARS = ['M','T','W','T','F','S','S'].map(day => ({ day, count: 0 }));

const MILESTONES = [
  { target: 1,  label: '1 Urge Defeated' },
  { target: 5,  label: '5 Urges Defeated' },
  { target: 10, label: '10 Urges Defeated' },
  { target: 25, label: '25 Urges Defeated' },
  { target: 50, label: '50 Urges Defeated' },
];

export default function Progress() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { urgeCount, urgesByDay } = useAuth();
  const barData = urgesByDay ?? EMPTY_BARS;

  // Scale counts to pixel heights (max 76px), min 4px for zero so grid is visible
  const maxCount = Math.max(...barData.map(b => b.count), 1);
  const scaledBars = barData.map(b => ({
    ...b,
    height: b.count === 0 ? 4 : Math.max(12, Math.round((b.count / maxCount) * 76)),
  }));

  const moneySaved = `$${urgeCount * 15}`;
  const timeSaved = `${urgeCount * 2}h`;

  // Find the index of the first milestone not yet achieved
  const nextMilestoneIdx = MILESTONES.findIndex(m => urgeCount < m.target);

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
            <Text style={styles.countNumber}>{urgeCount}</Text>
            <Text style={styles.countLabel}>URGES DEFEATED</Text>
            <Text style={styles.countSteps}>
              You are {urgeCount} steps closer to defeating binge eating
            </Text>
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
            {scaledBars.map((bar, i) => (
              <View key={i} style={styles.barColumn}>
                {bar.count > 0 && (
                  <Text style={[styles.barCount, i === TODAY_IDX && styles.barCountHighlight]}>
                    {bar.count}
                  </Text>
                )}
                <View style={styles.barWrapper}>
                  <View style={[
                    styles.bar,
                    { height: bar.height },
                    i === TODAY_IDX && styles.barHighlight,
                  ]} />
                </View>
                <Text style={[
                  styles.barLabel,
                  i === TODAY_IDX && styles.barLabelHighlight,
                ]}>{bar.day}</Text>
              </View>
            ))}
          </View>

        </View>

        {/* Recovery Milestones */}
        <Text style={styles.sectionTitle}>Recovery Milestones</Text>

        {MILESTONES.map((milestone, i) => {
          const achieved = urgeCount >= milestone.target;
          const isNext = i === nextMilestoneIdx;
          const progress = isNext ? Math.min(urgeCount / milestone.target, 1) : 0;
          return (
            <View key={milestone.target} style={styles.milestoneCard}>
              <View style={[styles.milestoneIconCircle, !achieved && styles.milestoneIconGray]}>
                <MaterialCommunityIcons
                  name={achieved ? 'trophy' : 'lock-outline'}
                  size={22}
                  color={achieved ? 'white' : '#999'}
                />
              </View>
              <View style={styles.milestoneInfo}>
                <Text style={styles.milestoneName}>{milestone.label}</Text>
                {achieved ? (
                  <Text style={styles.milestoneSubtext}>Achieved</Text>
                ) : isNext ? (
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarTrack}>
                      <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                    </View>
                  </View>
                ) : null}
              </View>
              {achieved
                ? <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
                : isNext
                  ? <Text style={styles.milestoneDays}>{urgeCount}/{milestone.target}</Text>
                  : <MaterialCommunityIcons name="lock-outline" size={22} color="#ccc" />
              }
            </View>
          );
        })}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="currency-usd" size={28} color="#7B1FA2" />
            <Text style={styles.statValue}>{moneySaved}</Text>
            <Text style={styles.statLabel}>MONEY SAVED</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={28} color="#7B1FA2" />
            <Text style={styles.statValue}>{timeSaved}</Text>
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
  countSteps: {
    fontSize: 13,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 8,
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
  barCount: {
    fontSize: 10,
    color: '#CE93D8',
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  barCountHighlight: {
    color: '#7B1FA2',
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
