import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import UrgeFooter from '../components/UrgeFooter';
import UrgeToolSheet from '../components/UrgeToolSheet';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';
import { pickAnotherUrgeScreen, getUrgeScreenRoute, markUrgeMethodVisited } from '@/constants/urgeScreenOptions';

const CURRENT_KEY = 'actions';

const ACTIVITIES = [
  { icon: 'exit-run', title: 'Leave the space you are currently in' },
  { icon: 'walk', title: 'Go on a walk outside' },
  { icon: 'cup-water', title: 'Go grab a cold glass of water and notice how it feels on your fingertips' },
  { icon: 'forum-outline', title: 'Go talk to a family member or friend about something completely unrelated' },
  { icon: 'run-fast', title: 'Do 10 jumping jacks' },
  { icon: 'music-note-outline', title: 'Put on your favorite song and pace the area you\'re currently in' },
  { icon: 'podcast', title: 'Listen to a podcast' },
];

const CARD_WIDTH = Dimensions.get('window').width - 40;

export default function ActionsToTake() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [switchVisible, setSwitchVisible] = useState(false);

  useEffect(() => {
    markUrgeMethodVisited(CURRENT_KEY);
  }, []);

  function handleScroll(e) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setIndex(Math.max(0, Math.min(ACTIVITIES.length - 1, idx)));
  }

  function tryAnother() {
    const next = pickAnotherUrgeScreen(CURRENT_KEY);
    if (next) markUrgeMethodVisited(next.key);
    router.replace(next ? next.route : '/urge-surfing');
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Gradients.hero.colors}
        start={Gradients.hero.start}
        end={Gradients.hero.end}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Actions to Take</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <Text style={styles.intro}>Swipe through a few things you can do right now instead.</Text>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.carouselWrap}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {ACTIVITIES.map((a, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardIconWrap}>
              <MaterialCommunityIcons name={a.icon} size={32} color={Colors.plum} />
            </View>
            <Text style={styles.cardTitle}>{a.title}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {ACTIVITIES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <UrgeFooter onTryAnother={tryAnother} onLongPressTryAnother={() => setSwitchVisible(true)} />

      <UrgeToolSheet
        visible={switchVisible}
        onClose={() => setSwitchVisible(false)}
        onSelect={(key) => {
          setSwitchVisible(false);
          markUrgeMethodVisited(key);
          router.replace(getUrgeScreenRoute(key));
        }}
        title="Switch Tools"
        subtitle="Pick a different way to work through this moment."
        excludeKey={CURRENT_KEY}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.topbarTitle,
    color: 'white',
  },
  intro: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondary,
    color: Colors.inkSoft,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  carouselWrap: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    flexGrow: 0,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 300,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.pop,
  },
  cardIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  cardTitle: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.hTitle,
    color: Colors.ink,
    textAlign: 'center',
    lineHeight: 30,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.line,
  },
  dotActive: {
    backgroundColor: Colors.plum,
    width: 20,
  },
});
