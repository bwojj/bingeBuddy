import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import HabitCard from './components/HabitCard';
import { useAuth } from '../context/AuthContext';
import { markRecoveryIntroSeen } from '../components/DataAPI';
import { Colors, FontFamily, FontSize, Radii, Shadows } from '../constants/theme';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BLANK_WEEK = [false, false, false, false, false, false, false];

// Shaped exactly like a real, freshly-seeded habit (0 streak, nothing done
// yet) — these previews are what the actual box on My Recovery looks like on
// day one, not a lookalike mockup.
const PREVIEW_EXERCISE = { name: 'Exercise', icon: 'exercise', streak: 0, doneToday: false, days: ALL_DAYS, weekCompletion: BLANK_WEEK };
const PREVIEW_JOURNALING = { name: 'Journaling', icon: 'journaling', streak: 0, doneToday: false, days: ALL_DAYS, weekCompletion: BLANK_WEEK };
const PREVIEW_MEDITATION = { name: 'Meditation', icon: 'meditation', streak: 0, doneToday: false, days: ALL_DAYS, weekCompletion: BLANK_WEEK };

const STEPS = [
  {
    icon: (c) => <Ionicons name="calendar-outline" size={30} color={c} />,
    title: 'Welcome to Your Recovery Plan',
    body: "This is where recovery starts. Beating binge eating comes down to consistency, not willpower and not perfect days. You'll build a small set of daily habits and keep them going on a steady schedule. Those repeated actions are what slowly loosen the hold the binge cycle has on you. None of it is complicated. It works because you keep showing up, day after day.",
  },
  {
    icon: (c) => <MaterialCommunityIcons name="brain" size={30} color={c} />,
    title: "It's About Beating the Urge",
    body: "Everything in this app points at one thing: learning to sit with an urge instead of acting on it. The moment between wanting to binge and choosing not to is where recovery is actually won. Every time you make it through that moment, the urge loses a little of its power. Get through it enough times and the urges that used to run your life stop calling the shots.",
  },
  {
    icon: (c) => <Ionicons name="barbell-outline" size={30} color={c} />,
    title: 'Exercise',
    body: "Moving your body is one of the strongest things you can do for your mental health, and it's a real weapon against the urge to binge. It doesn't have to be intense and it doesn't have to look like anyone else's routine. Lifting, a walk around the block, a bike ride, a class at the gym, stretching, shooting hoops, whatever gets you moving all counts. What matters is that you show up for it, not how hard you go.",
    preview: PREVIEW_EXERCISE,
  },
  {
    icon: (c) => <Ionicons name="book-outline" size={30} color={c} />,
    title: 'Journaling',
    body: "Writing down how you feel, and what's going on around your urges, is how you start seeing your own patterns. You'll catch the triggers you never noticed, the times of day that hit hardest, the moods that set you off. It's also where you look back and see how far you've actually come. Putting words to what's happening takes a lot of the power out of it.",
    preview: PREVIEW_JOURNALING,
  },
  {
    icon: (c) => <MaterialCommunityIcons name="meditation" size={30} color={c} />,
    title: 'Meditation',
    body: "Meditation is mindfulness you can practice, like training for your attention. The idea is simple. Focus on your breath, and every time your mind wanders off, bring it back without beating yourself up about it. That skill doesn't stay on the mat. Carried into your day, it keeps you present, and being present is where an urge loses its grip. It's hard to binge on autopilot when you're actually paying attention to what you're doing.",
    preview: PREVIEW_MEDITATION,
  },
  {
    icon: (c) => <Ionicons name="add-circle-outline" size={30} color={c} />,
    title: 'Make It Yours',
    body: "These habits are a starting point, not the full picture. Recovery looks different for everyone, so you can add habits of your own, anything you genuinely believe will help you stay on track. Better sleep, more water, texting a friend when it gets hard, prepping your meals, whatever supports you. Tap Add a Habit whenever you want and shape a plan that actually fits your life.",
    addHabitPreview: true,
  },
  {
    title: 'You Can Be Free',
    body: "Freedom from binge eating is real, and it's closer than it feels right now. Commit to these tools and keep using them, especially on the days you don't feel like it. That's how the change sticks. Not perfectly and not overnight, but for real. You've got everything you need to start.",
    isFinal: true,
  },
];

export default function RecoveryIntro() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setIsAuthenticated, refreshUserData } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;
  const hasHabitPreview = !!(step.preview || step.addHabitPreview);

  function handleBack() {
    if (!isFirst) setStepIndex((i) => i - 1);
  }

  async function handleNext() {
    if (isLast) {
      setFinishing(true);
      const marked = await markRecoveryIntroSeen();
      if (!marked) {
        setFinishing(false);
        Alert.alert('Something went wrong', "Couldn't save your progress. Please check your connection and try again.");
        return;
      }
      // Refetch userPreferences before navigating so the root layout's gate
      // (which reads userPreferences.seen_recovery_intro) doesn't bounce an
      // already-authenticated existing user straight back to this screen.
      await refreshUserData();
      setIsAuthenticated(true);
      router.replace('/(main)');
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  return (
    <ScrollView
      style={[styles.container, hasHabitPreview && styles.containerDark]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        {isFirst ? (
          <View style={{ width: 26 }} />
        ) : (
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="chevron-back" size={26} color={Colors.ink} />
          </TouchableOpacity>
        )}
        <Text style={styles.eyebrow}>MY RECOVERY</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Centered body — the screen's focal content sits in the middle of the
          page rather than pinned under the top row */}
      <View style={styles.centerBlock}>
        {/* Icon */}
        <View style={styles.iconWrapper}>
          {step.isFinal ? (
            <Image source={require('../assets/images/bingebuddy3.png')} style={styles.logoImage} resizeMode="cover" />
          ) : (
            <View style={styles.iconCircle}>
              {step.icon(Colors.plum)}
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title}>{step.title}</Text>

        {/* Body */}
        <Text style={styles.body}>{step.body}</Text>

        {/* Habit box preview — set against a darker "stage" panel so the
            (white) card itself pops instead of blending into the page */}
        {step.preview && (
          <View style={styles.previewStage}>
            <HabitCard habit={step.preview} />
          </View>
        )}

        {/* Add-a-Habit box preview */}
        {step.addHabitPreview && (
          <View style={styles.previewStage}>
            <View style={styles.addHabitPreviewBtn}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.plum} />
              <Text style={styles.addHabitPreviewText}>Add a Habit</Text>
            </View>
          </View>
        )}
      </View>

      {/* Dot progress */}
      <View style={styles.dotsRow}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i <= stepIndex && styles.dotActive]} />
        ))}
      </View>

      {/* Next / Finish button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={finishing}>
        <Text style={styles.nextButtonText}>
          {isLast ? (finishing ? 'Entering…' : 'Enter My Recovery') : 'Next'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  // Used on steps with a habit-card preview so the (white) card has a
  // darker page behind it to stand out against, instead of blending in.
  containerDark: {
    backgroundColor: Colors.bg,
  },
  content: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },

  /* Top row */
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  eyebrow: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.plumSoft,
    letterSpacing: 1.5,
  },

  /* Centered content block — sits in the middle of the page rather than
     directly under the top row */
  centerBlock: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 12,
  },

  /* Icon */
  iconWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.plumTint,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    ...Shadows.pop,
  },

  /* Title */
  title: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.flowTitle,
    color: Colors.ink,
    textAlign: "center",
    marginBottom: 14,
    lineHeight: 40,
    letterSpacing: -0.4,
  },

  /* Body */
  body: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.body,
    color: Colors.inkSoft,
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 24,
  },

  /* Habit preview — a darker "stage" panel bleeding edge-to-edge, so the
     white habit card sitting on it visibly pops off the page */
  previewStage: {
    marginHorizontal: -24,
    marginBottom: 8,
    paddingVertical: 16,
    backgroundColor: Colors.plumTint,
    borderRadius: Radii.lg,
  },

  /* Add-a-habit preview */
  addHabitPreviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    paddingVertical: 14,
    borderRadius: Radii.btn,
    borderWidth: 1.5,
    borderColor: Colors.plum,
    backgroundColor: Colors.surface,
  },
  addHabitPreviewText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondary,
    color: Colors.plum,
  },

  /* Dot progress */
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 'auto',
    paddingTop: 24,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.line,
  },
  dotActive: {
    backgroundColor: Colors.plum,
  },

  /* Next button */
  nextButton: {
    width: "100%",
    height: 52,
    backgroundColor: Colors.plum,
    borderRadius: Radii.btn,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.pop,
  },
  nextButtonText: {
    color: "white",
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
  },
});
