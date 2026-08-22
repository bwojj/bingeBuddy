import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePostHog } from 'posthog-react-native';
import HomeMotivation from '../components/HomeMotivation';
import TabBar from '../components/TabBar';
import ConsistencyCard from '../components/ConsistencyCard';
import UrgeToolSheet from '../components/UrgeToolSheet';
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from '@/components/LoadingScreen';
import { getEntries } from '@/components/JournalAPI';
import { setDefaultUrgeScreen } from '@/components/DataAPI';
import { URGE_SCREEN_OPTIONS } from '@/constants/urgeScreenOptions';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients, Spacing } from '@/constants/theme';


const OVERSCROLL_BUFFER = 1000;

function getGreeting() {
  const hour = new Date().getHours(); 
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [lastEntry, setLastEntry] = useState(null);
  const [configVisible, setConfigVisible] = useState(false);
  const [switchingDefault, setSwitchingDefault] = useState(false);
  const [headerContentHeight, setHeaderContentHeight] = useState(160);
  const mergedHeight = OVERSCROLL_BUFFER + headerContentHeight;
  const mergedGradientStart = {
    x: Gradients.hero.start.x,
    y: (OVERSCROLL_BUFFER + Gradients.hero.start.y * headerContentHeight) / mergedHeight,
  };
  const mergedGradientEnd = {
    x: Gradients.hero.end.x,
    y: (OVERSCROLL_BUFFER + Gradients.hero.end.y * headerContentHeight) / mergedHeight,
  };

  const { userCredentials, userPreferences, userLoading, urgeCount, refreshUserData } = useAuth();
  const posthog = usePostHog();

  const [localDefaultKey, setLocalDefaultKey] = useState(undefined);
  useEffect(() => {
    if (userPreferences) setLocalDefaultKey(userPreferences.default_urge_screen || null);
  }, [userPreferences?.default_urge_screen]);

  const configurableUrgeOptions = userPreferences?.is_premium
    ? URGE_SCREEN_OPTIONS
    : URGE_SCREEN_OPTIONS.filter((opt) => opt.key !== 'coach');

  function chooseDefaultUrgeScreen(key) {
    setLocalDefaultKey(key);
    setConfigVisible(false);
    setSwitchingDefault(true);
    setDefaultUrgeScreen(key).then(async (success) => {
      if (success) {
        await refreshUserData();
      } else {
        Alert.alert('Error', "Couldn't save your preference. Please try again.");
      }
      setSwitchingDefault(false);
    });
  }

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

  if (userLoading || switchingDefault) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.headerWrap}>
          <LinearGradient
            colors={Gradients.hero.colors}
            start={mergedGradientStart}
            end={mergedGradientEnd}
            style={[styles.headerBgGradient, { top: -OVERSCROLL_BUFFER, height: mergedHeight }]}
          />
          <View
            onLayout={(e) => setHeaderContentHeight(e.nativeEvent.layout.height)}
            style={[styles.headerBg, { paddingTop: insets.top + 15 }]}
          >
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()}, {userCredentials?.first_name}!</Text>
              <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sosWrapper}>
          <TouchableOpacity
            onPress={() => {
              posthog?.capture('panic_button_clicked');
              router.push('/urge-check-in');
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={Gradients.hero.colors}
              start={Gradients.hero.start}
              end={Gradients.hero.end}
              style={styles.sosCard}
            >
              <Image source={require('../../assets/images/bingebuddy3.png')} style={styles.sosIconWrap} resizeMode="cover" />
              <View style={styles.sosInfo}>
                <Text style={styles.sosTitle}>Feeling an urge?</Text>
                <Text style={styles.sosSubtext}>Tap for immediate support</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.85)" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.configBtn} onPress={() => setConfigVisible(true)} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={12} color={Colors.plum} />
            <Text style={styles.configBtnText}>Configure Urge Details</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Motivation</Text>
        <HomeMotivation userPreferences={userPreferences}/>

        <Text style={styles.sectionTitle}>Recovery Snapshot</Text>
        <ConsistencyCard
          mode="urges"
          urgeCount={urgeCount}
          onPress={() => router.push('/my-plan')}
        />

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

        <View style={{ height: 90 }} />
      </ScrollView>

      <TabBar activeTab="dashboard" />

      <UrgeToolSheet
        visible={configVisible}
        onClose={() => setConfigVisible(false)}
        onSelect={chooseDefaultUrgeScreen}
        title="Configure Urge Details"
        subtitle={'Choose the tool that opens first when you tap "Feeling an urge?"'}
        selectedKey={localDefaultKey}
        options={configurableUrgeOptions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  headerWrap: {
    position: 'relative',
  },
  headerBgGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerBg: {
    paddingBottom: 24,
  },
  sosWrapper: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: Radii.card,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    ...Shadows.pop,
  },
  sosIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 17,
  },
  sosInfo: {
    flex: 1,
  },
  sosTitle: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.cardTitle,
    color: 'white',
  },
  sosSubtext: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 3,
  },
  configBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 8,
    marginLeft: 14,
    paddingVertical: 4,
  },
  configBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.eyebrowSm,
    color: Colors.plum,
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
