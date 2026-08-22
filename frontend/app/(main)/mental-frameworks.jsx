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

const CURRENT_KEY = 'mental_frameworks';
const STEP_LOCK_SECONDS = 8;

const FRAMEWORKS = [
  {
    icon: 'crystal-ball',
    title: 'Future Self',
    steps: [
      'Take a deep breath',
      'Focus on the **future self** you are working towards',
      'Picture how they look, how they carry themselves, and the **mindset** they hold',
      'Imagine that future self standing beside you right now, watching this moment',
      'How would they feel? Would they feel proud of you, or would they wish you\'d choose differently?',
      'Think about how **grateful** they would be to you for having **beaten this urge**',
    ],
  },
  {
    icon: 'account-check-outline',
    title: 'Identity',
    steps: [
      'Take a deep breath',
      'Gently repeat to yourself, **"I am not a binge eater"**',
      'Reconnect with the **goals** you\'re working towards',
      'Think about the **identity** of the person you\'re becoming',
      'Recognize that you\'re about to make a **conscious choice, entirely your own**',
      'Repeat this to yourself: **"I have full control over whether I binge right now. If I truly have that control, why would I go against what I actually want?"**',
    ],
  },
  {
    icon: 'heart-outline',
    title: 'Emotional',
    steps: [
      'Take a deep breath',
      'Take a moment to notice **what you\'re feeling right now**',
      '**Try to pinpoint what\'s really going on** — what triggered this feeling?',
      'Think of a few small, active steps that could help this situation',
      'Ask yourself honestly what bingeing would actually **solve**',
      'Ask yourself: **"Will this fix the problem, or just make it heavier to carry?"**',
      'Remind yourself that binge eating tends to **add more weight** on top of what you\'re already carrying — weight you don\'t need right now',
    ],
  },
  {
    icon: 'trophy-outline',
    title: 'Past Evidence',
    steps: [
      'Take a deep breath',
      'Think of something **hard** you\'ve pushed through recently — a tough workout, a goal you reached, a hard run',
      'Remember how difficult that felt, and how **disciplined** you were to see it through',
      'Repeat this to yourself: **"If I could do {habit} even when it was hard, I can get through this too."**',
    ],
  },
  {
    icon: 'brain',
    title: 'Brain Over Binge Approach',
    steps: [
      'Take a deep breath',
      'Recognize the urge as an **intrusive thought** — a signal from an older part of your brain that isn\'t looking out for what\'s actually best for you',
      'Remind yourself that **you are separate from this urge**; it\'s simply a thought passing through, and you\'re the one who decides whether to act on it',
      '**Let the urge be there without fighting it** — observe it, and let it pass through your mind like background noise',
      'Say to yourself: **"This urge isn\'t me. It\'s a passing thought with no real power, and it doesn\'t reflect what I actually want."**',
      '**Choose not to act** on an urge that doesn\'t represent the real you',
    ],
  },
  {
    icon: 'calendar-clock-outline',
    title: 'Short Term',
    steps: [
      'Take a deep breath',
      'Picture **yourself tomorrow**',
      'Think about everything you have **planned for tomorrow**',
      'Picture the version of you who **got through this urge** — how good would that feel?',
      'Now picture the version of you who **gave in** — how would they feel? What would they be telling themselves right now?',
      'Remind yourself: **"If I let this urge win, I\'m choosing to let down the person I\'m working to become — and that\'s a choice I get to make."**',
    ],
  },
];

function renderStepText(text) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <Text key={i} style={styles.stepTextBold}>{part.slice(2, -2)}</Text>
      : <Text key={i}>{part}</Text>
  );
}

function shuffledIndices(length) {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const CARD_WIDTH = Dimensions.get('window').width - 40;

export default function MentalFrameworks() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [order] = useState(() => shuffledIndices(FRAMEWORKS.length));
  const [position, setPosition] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [switchVisible, setSwitchVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(STEP_LOCK_SECONDS);

  const framework = FRAMEWORKS[order[position]];

  useEffect(() => {
    markUrgeMethodVisited(CURRENT_KEY);
  }, []);

  useEffect(() => {
    setSecondsLeft(STEP_LOCK_SECONDS);
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [position, stepIndex]);

  const locked = secondsLeft > 0;

  function handleStepScroll(e) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setStepIndex(Math.max(0, Math.min(framework.steps.length - 1, idx)));
  }

  function tryAnother() {
    if (position < order.length - 1) {
      setPosition(position + 1);
      setStepIndex(0);
    } else {
      const next = pickAnotherUrgeScreen(CURRENT_KEY);
      if (next) markUrgeMethodVisited(next.key);
      router.replace(next ? next.route : '/urge-surfing');
    }
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
        <Text style={styles.headerTitle}>Mental Frameworks</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.frameworkHeader}>
        <View style={styles.frameworkIconWrap}>
          <MaterialCommunityIcons name={framework.icon} size={24} color={Colors.plum} />
        </View>
        <Text style={styles.frameworkTitle}>{framework.title}</Text>
      </View>

      <View style={styles.timerPill}>
        {locked ? (
          <>
            <Ionicons name="time-outline" size={14} color={Colors.plum} />
            <Text style={styles.timerText}>Sit with this for {secondsLeft}s…</Text>
          </>
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={14} color={Colors.sage} />
            <Text style={[styles.timerText, styles.timerTextReady]}>Ready — swipe when you&apos;re ready</Text>
          </>
        )}
      </View>

      <ScrollView
        key={position}
        horizontal
        pagingEnabled
        scrollEnabled={!locked}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleStepScroll}
        style={styles.carouselWrap}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {framework.steps.map((step, i) => (
          <View key={i} style={styles.stepCard}>
            <Text style={styles.stepText}>{renderStepText(step)}</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.counter}>{stepIndex + 1} / {framework.steps.length}</Text>

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
  frameworkHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  frameworkIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  frameworkTitle: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.hTitle,
    color: Colors.ink,
    textAlign: 'center',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  timerText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondarySm,
    color: Colors.plum,
  },
  timerTextReady: {
    color: Colors.sage,
  },
  carouselWrap: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    flexGrow: 0,
  },
  stepCard: {
    width: CARD_WIDTH,
    minHeight: 260,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.pop,
  },
  stepText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.hTitle,
    color: Colors.ink,
    textAlign: 'center',
    lineHeight: 30,
  },
  stepTextBold: {
    fontFamily: FontFamily.sansBold,
  },
  counter: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondarySm,
    color: Colors.inkFaint,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
});
