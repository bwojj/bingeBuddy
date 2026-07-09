import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import HomeQuoteBox from '../components/HomeQuoteBox';
import HomeMotivation from '../components/HomeMotivation';
import TabBar from '../components/TabBar';
import SOSButton from '../components/SOSButton';
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from '@/components/LoadingScreen';
import { getEntries } from '@/components/JournalAPI';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients, Spacing } from '@/constants/theme';

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

        {/* Plum gradient header - scrolls with content */}
        <LinearGradient
          colors={Gradients.hero.colors}
          start={Gradients.hero.start}
          end={Gradients.hero.end}
          style={[styles.headerBg, { paddingTop: insets.top + 15 }]}
        >
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Good Morning, {userCredentials?.first_name}!</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
          </View>
        </LinearGradient>

        {/* Quote Card - overlaps bottom of header */}
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
            <MaterialCommunityIcons name="trophy" size={34} color={Colors.plum} />
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
              <Ionicons name="document-text-outline" size={22} color={Colors.inkFaint} />
              <Text style={styles.journalEmptyText}>No entries yet — write your first one.</Text>
            </View>
          )}
          <Text style={styles.journalLink}>View Journal →</Text>
        </TouchableOpacity>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 90 }} />
      </ScrollView>

      <SOSButton />
      <TabBar activeTab="dashboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  /* Fills the iOS overscroll bounce area at the top with plum */
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
    paddingBottom: 68,
  },
  quoteWrapper: {
    marginTop: -48,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  greetingContainer: {
    paddingHorizontal: Spacing.screenH,
    marginBottom: 20,
  },
  greeting: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.heroTitle,
    color: 'white',
  },
  date: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.secondary,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 5,
  },
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

  /* Progress Snapshot */
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    marginHorizontal: 20,
    marginTop: 16,
    padding: Spacing.cardPadding,
    alignItems: 'center',
    ...Shadows.card,
  },
  progressTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.cardTitle,
    color: Colors.ink,
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
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.dashboardStat,
    color: Colors.plum,
  },
  urgeCountLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.plumSoft,
    letterSpacing: 2,
    marginBottom: 10,
  },
  progressSubtext: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
  },
  /* Journal Card */
  journalCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    marginHorizontal: 24,
    marginTop: 0,
    padding: Spacing.cardPadding,
    ...Shadows.card,
  },
  journalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  journalEntryTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
    flex: 1,
    marginRight: 8,
  },
  journalTypeBadge: {
    backgroundColor: Colors.plumTint,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  journalTypeText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.plum,
  },
  journalEntrySnippet: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
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
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkFaint,
  },
  journalLink: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondarySm,
    color: Colors.plum,
  },
});
