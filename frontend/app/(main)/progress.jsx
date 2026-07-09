import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from "@/context/AuthContext";
import TabBar from '../components/TabBar';
import SOSButton from '../components/SOSButton';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';

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
        {/* Overscroll fix: fills iOS bounce area with plum */}
        <View style={styles.overscrollFill} />

        {/* Plum gradient header - scrolls with content */}
        <LinearGradient
          colors={Gradients.hero.colors}
          start={Gradients.hero.start}
          end={Gradients.hero.end}
          style={[styles.headerBg, { paddingTop: insets.top + 10 }]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={26} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Progress History</Text>
            <View style={{ width: 22 }} />
          </View>

          {/* Urges Defeated Count */}
          <View style={styles.countContainer}>
            <Text style={styles.countNumber}>{urgeCount}</Text>
            <Text style={styles.countLabel}>URGES DEFEATED</Text>
            <Text style={styles.countSteps}>
              You are {urgeCount} steps closer to defeating binge eating
            </Text>
          </View>
        </LinearGradient>

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
              <View style={[
                styles.milestoneIconCircle,
                achieved ? styles.milestoneIconDone : isNext ? styles.milestoneIconTint : styles.milestoneIconLock,
              ]}>
                <Ionicons
                  name={achieved ? 'checkmark' : isNext ? 'flag' : 'lock-closed-outline'}
                  size={20}
                  color={achieved ? 'white' : isNext ? Colors.plum : Colors.inkFaint}
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
                ) : (
                  <Text style={styles.milestoneSubtext}>Locked</Text>
                )}
              </View>
              {achieved
                ? <Ionicons name="checkmark-circle" size={26} color={Colors.sage} />
                : isNext
                  ? <Text style={styles.milestoneDays}>{urgeCount}/{milestone.target}</Text>
                  : <Ionicons name="lock-closed-outline" size={20} color={Colors.inkFaint} />
              }
            </View>
          );
        })}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="currency-usd" size={26} color={Colors.plum} />
            <Text style={styles.statValue}>{moneySaved}</Text>
            <Text style={styles.statLabel}>MONEY SAVED</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={26} color={Colors.plum} />
            <Text style={styles.statValue}>{timeSaved}</Text>
            <Text style={styles.statLabel}>TIME GAINED</Text>
          </View>
        </View>

        {/* Bottom spacer */}
        <View style={{ height: 90 }} />
      </ScrollView>

      <SOSButton />
      <TabBar activeTab="progress" />
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
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.topbarTitle,
    color: 'white',
  },

  /* Urges Defeated Count */
  countContainer: {
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  countNumber: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.statHuge,
    color: 'white',
    textAlign: 'center',
  },
  countLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrow,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2.5,
    marginTop: 6,
    textAlign: 'center',
  },
  countSteps: {
    fontFamily: FontFamily.serifItalic,
    fontSize: FontSize.secondary,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 10,
  },

  /* Card */
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    marginHorizontal: 20,
    padding: 20,
    ...Shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.cardTitle,
    color: Colors.ink,
  },
  thisWeekBadge: {
    borderWidth: 1,
    borderColor: Colors.plum,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  thisWeekText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.eyebrow,
    color: Colors.plum,
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
    borderRadius: 5,
    backgroundColor: '#D8C7DE',
  },
  barHighlight: {
    backgroundColor: Colors.plum,
  },
  barCount: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: '#D8C7DE',
    marginBottom: 2,
    textAlign: 'center',
  },
  barCountHighlight: {
    color: Colors.plumSoft,
  },
  barLabel: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.eyebrow,
    color: Colors.inkFaint,
    marginTop: 6,
  },
  barLabelHighlight: {
    color: Colors.plum,
  },
  /* Section Title */
  sectionTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: Colors.inkFaint,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
  },

  /* Milestone Cards */
  milestoneCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.soft,
  },
  milestoneIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  milestoneIconDone: {
    backgroundColor: Colors.sage,
  },
  milestoneIconTint: {
    backgroundColor: Colors.plumTint,
  },
  milestoneIconLock: {
    backgroundColor: '#EAE4EC',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
  },
  milestoneSubtext: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.eyebrow,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  milestoneDays: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.eyebrow,
    color: Colors.plum,
  },
  progressBarContainer: {
    marginTop: 6,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.line,
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    width: '70%',
    backgroundColor: Colors.plum,
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
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: 20,
    alignItems: 'center',
    ...Shadows.soft,
  },
  statValue: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.hTitle,
    color: Colors.ink,
    marginTop: 6,
  },
  statLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
    letterSpacing: 1.2,
    marginTop: 4,
  },
});
