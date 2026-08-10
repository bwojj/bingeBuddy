import { Text, View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from "@/context/AuthContext";
import { getAllUrges } from '@/components/UrgeAPI';
import TabBar from '../components/TabBar';
import { Colors, FontFamily, FontSize, Radii, Shadows } from '@/constants/theme';

// Shown under the urge count — one is picked at random each time the
// screen is focused (see useState lazy initializer below).
const ENCOURAGEMENTS = [
  "You are stronger than this urge.",
  "This feeling will pass. You won't let it win.",
  "You've beaten this before — you can again.",
  "One moment doesn't define you.",
  "Every time you resist, you grow stronger.",
  "You showed up here — that's already a win.",
];

const MILESTONES = [
  { target: 3, label: '3 Urges Beat' },
  { target: 5, label: '5 Urges Beat' },
  { target: 10, label: '10 Urges Beat' },
  { target: 25, label: '25 Urges Beat' },
  { target: 50, label: '50 Urges Beat' },
  { target: 100, label: '100 Urges Beat' },
];

function formatDate(isoString) {
  return new Date(isoString)
    .toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    .toUpperCase();
}

export default function Me() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userCredentials, urgeCount, userLoading } = useAuth();
  const [recentUrges, setRecentUrges] = useState([]);
  const [recentUrgesLoading, setRecentUrgesLoading] = useState(true);
  const [message] = useState(() => ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);

  useFocusEffect(
    useCallback(() => {
      setRecentUrgesLoading(true);
      getAllUrges()
        .then((urges) => setRecentUrges(urges.slice(0, 5)))
        .finally(() => setRecentUrgesLoading(false));
    }, [])
  );

  const displayName = userCredentials?.first_name || userCredentials?.username || 'Your Profile';
  const displaySub = userCredentials?.email || '';

  const nextMilestoneIdx = MILESTONES.findIndex((m) => urgeCount < m.target);

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: avatar + name, settings gear top-right */}
        <View style={[styles.headerRow, { paddingTop: insets.top + 16 }]}>
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-circle" size={44} color={Colors.plum} />
            </View>
            <View>
              <Text style={styles.profileName}>{displayName}</Text>
              {!!displaySub && <Text style={styles.profileSub}>{displaySub}</Text>}
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsBtn} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={24} color={Colors.plum} />
          </TouchableOpacity>
        </View>

        {/* Urges defeated + encouragement */}
        <View style={styles.countCard}>
          <LinearGradient
            colors={[Colors.surface, Colors.plumTint2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.countWatermarkWrap}>
            <MaterialCommunityIcons name="trophy" size={150} color="rgba(91,46,107,0.06)" />
          </View>
          <View style={styles.countIconBadge}>
            <MaterialCommunityIcons name="trophy" size={26} color={Colors.plum} />
          </View>
          {userLoading ? (
            <ActivityIndicator color={Colors.plum} size="large" style={styles.countLoading} />
          ) : (
            <Text style={styles.countNumber}>{urgeCount}</Text>
          )}
          <Text style={styles.countLabel}>URGES DEFEATED</Text>
          <Text style={styles.encouragement}>{message}</Text>
        </View>

        {/* Log an Urge */}
        <TouchableOpacity style={styles.logUrgeBtn} onPress={() => router.push('/log-urge')} activeOpacity={0.85}>
          <Ionicons name="add" size={16} color="white" />
          <Text style={styles.logUrgeBtnText}>Log an Urge</Text>
        </TouchableOpacity>

        {/* Recent urges */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Urges</Text>
          <TouchableOpacity onPress={() => router.push('/all-urges')} activeOpacity={0.6}>
            <Text style={styles.viewAllLink}>View All →</Text>
          </TouchableOpacity>
        </View>

        {recentUrgesLoading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator color={Colors.plum} size="small" />
            <Text style={styles.emptyText}>Loading recent urges…</Text>
          </View>
        ) : recentUrges.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-done-outline" size={22} color={Colors.inkFaint} />
            <Text style={styles.emptyText}>No urges logged yet.</Text>
          </View>
        ) : (
          recentUrges.map((u) => (
            <View key={u.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>{formatDate(u.urge_time)}</Text>
                <View style={styles.badge}>
                  <Ionicons name="checkmark" size={12} color={Colors.sage} />
                </View>
              </View>
              {!!u.urge_note && <Text style={styles.entryNote}>{u.urge_note}</Text>}
            </View>
          ))
        )}

        {/* Goal cards */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Goals</Text>
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
                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                  </View>
                ) : (
                  <Text style={styles.milestoneSubtext}>Locked</Text>
                )}
              </View>
              {achieved
                ? <Ionicons name="checkmark-circle" size={26} color={Colors.sage} />
                : isNext
                  ? <Text style={styles.milestoneCount}>{urgeCount}/{milestone.target}</Text>
                  : <Ionicons name="lock-closed-outline" size={20} color={Colors.inkFaint} />
              }
            </View>
          );
        })}

        {/* Bottom spacer */}
        <View style={{ height: 90 }} />
      </ScrollView>

      <TabBar activeTab="me" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.cardTitle,
    color: Colors.ink,
  },
  profileSub: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Urges defeated + encouragement */
  countCard: {
    borderRadius: Radii.card,
    marginHorizontal: 20,
    alignItems: 'center',
    padding: 22,
    marginBottom: 20,
    overflow: 'hidden',
    ...Shadows.card,
  },
  countWatermarkWrap: {
    position: 'absolute',
    right: -26,
    top: -30,
    transform: [{ rotate: '18deg' }],
  },
  countIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countNumber: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.statHuge,
    color: Colors.plum,
    marginTop: 10,
  },
  // Matches countNumber's rendered height so the label below doesn't jump
  // when swapping between the two.
  countLoading: {
    height: 74,
    justifyContent: 'center',
    marginTop: 10,
  },
  countLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrow,
    color: Colors.plum,
    letterSpacing: 1.8,
    marginTop: -10,
  },
  encouragement: {
    fontFamily: FontFamily.serifItalic,
    fontSize: FontSize.secondary,
    color: Colors.inkSoft,
    textAlign: 'center',
    marginTop: 8,
  },

  /* Log an Urge */
  logUrgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 20,
    paddingVertical: 13,
    borderRadius: Radii.btn,
    backgroundColor: Colors.plum,
    marginBottom: 24,
    ...Shadows.pop,
  },
  logUrgeBtnText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.body,
    color: 'white',
  },

  /* Section header row */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: Colors.inkFaint,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  viewAllLink: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondarySm,
    color: Colors.plum,
  },

  /* Recent urge entries */
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    marginHorizontal: 20,
    padding: 16,
    ...Shadows.soft,
  },
  emptyText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkFaint,
  },
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
    marginBottom: 8,
  },
  entryDate: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
    letterSpacing: 0.6,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.sageTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryNote: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
    lineHeight: 19,
  },

  /* Goal / milestone cards */
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    ...Shadows.soft,
  },
  milestoneIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    backgroundColor: Colors.bg,
  },
  milestoneInfo: {
    flex: 1,
    marginRight: 10,
  },
  milestoneName: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
    marginBottom: 6,
  },
  milestoneSubtext: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkFaint,
  },
  milestoneCount: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondarySm,
    color: Colors.plum,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.bg,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.plum,
  },
});
