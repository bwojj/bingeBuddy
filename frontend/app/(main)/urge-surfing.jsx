import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';

const SURF_SECONDS = 5 * 60;
const RING_SIZE = 216;
const STROKE_WIDTH = 14;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Shown once every other urge-support method has already been tried
export default function UrgeSurfing() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(SURF_SECONDS);

  useEffect(() => {
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
  }, []);

  const done = secondsLeft === 0;
  const elapsed = SURF_SECONDS - secondsLeft;
  const progress = elapsed / SURF_SECONDS;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

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
        <Text style={styles.headerTitle}>Urge Surfing</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.middle}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="waves" size={30} color={Colors.plum} />
        </View>

        <Text style={styles.description}>
          You&apos;ve worked through everything this app has to offer right now — and that&apos;s okay. Sometimes the most
          powerful thing you can do is nothing at all. Take 5 minutes. Put the phone down and just sit with the
          thought. Don&apos;t fight it and don&apos;t act on it — just notice it rise, and let it fall on its own, like a
          wave. It will pass.
        </Text>

        <View style={styles.ringWrap}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={Colors.line}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={Colors.plum}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              fill="none"
              rotation={-90}
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>
            <Text style={styles.ringLabel}>{done ? 'COMPLETE' : 'REMAINING'}</Text>
          </View>
        </View>

        {done && (
          <View style={styles.optionsWrap}>
            <Text style={styles.doneText}>How are you feeling?</Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.push('/log-urge')}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="trophy" size={20} color="white" />
              <Text style={styles.primaryBtnText}>I Have Beaten the Urge</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.replace('/mental-frameworks')}
              activeOpacity={0.75}
            >
              <Text style={styles.secondaryBtnText}>Look at the Frameworks Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={{ height: insets.bottom + 24 }} />
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
    marginBottom: 32,
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
  middle: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  description: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.body,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  timer: {
    fontFamily: FontFamily.serifMedium,
    fontSize: 44,
    color: Colors.ink,
    fontVariant: ['tabular-nums'],
  },
  ringLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrow,
    color: Colors.inkFaint,
    letterSpacing: 2,
    marginTop: 4,
  },
  optionsWrap: {
    alignSelf: 'stretch',
    alignItems: 'stretch',
    marginTop: 24,
  },
  doneText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.body,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 16,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.plum,
    borderRadius: Radii.btn,
    paddingVertical: 18,
    marginBottom: 12,
    ...Shadows.pop,
  },
  primaryBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
    color: 'white',
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  secondaryBtnText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.body,
    color: Colors.inkSoft,
  },
});
