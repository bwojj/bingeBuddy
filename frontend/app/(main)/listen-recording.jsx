import { Text, View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { getPanicAudio } from '@/components/DataAPI';
import UrgeFooter from '../components/UrgeFooter';
import UrgeToolSheet from '../components/UrgeToolSheet';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';
import { pickAnotherUrgeScreen, getUrgeScreenRoute, markUrgeMethodVisited } from '@/constants/urgeScreenOptions';

const CURRENT_KEY = 'audio';

const TIPS = [
  'Find somewhere quiet, ideally with headphones, before you press play.',
  "Listen all the way through — don't skip ahead, even if the urge fades early.",
  "It's your own voice and your own reasons. Let it land as a reminder from you, to you.",
  "Replay it as many times as you need to — there's no limit.",
];

export default function ListenRecording() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [switchVisible, setSwitchVisible] = useState(false);

  const player = useAudioPlayer(url ? { uri: url } : null);
  const status = useAudioPlayerStatus(player);
  const playing = status.playing;

  useEffect(() => {
    getPanicAudio().then((u) => {
      setUrl(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    markUrgeMethodVisited(CURRENT_KEY);
  }, []);

  function togglePlayback() {
    if (playing) {
      player.pause();
    } else {
      if (status.didJustFinish || status.currentTime >= (status.duration || 0)) {
        player.seekTo(0);
      }
      player.play();
    }
  }

  function tryAnother() {
    const next = pickAnotherUrgeScreen(CURRENT_KEY);
    if (next) markUrgeMethodVisited(next.key);
    router.replace(next ? next.route : '/urge-surfing');
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={Gradients.hero.colors}
          start={Gradients.hero.start}
          end={Gradients.hero.end}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Listen to Your Recording</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <Text style={styles.sectionLabel}>HOW TO USE THIS</Text>
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="bulb-outline" size={18} color={Colors.plum} />
            <Text style={styles.cardTitle}>Getting the Most Out of It</Text>
          </View>
          {TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>YOUR MESSAGE</Text>
        {loading ? (
          <View style={[styles.card, styles.centerCard]}>
            <ActivityIndicator color={Colors.plum} />
          </View>
        ) : url ? (
          <View style={styles.card}>
            <TouchableOpacity style={styles.playBtn} onPress={togglePlayback} activeOpacity={0.85}>
              <Ionicons name={playing ? 'pause' : 'play'} size={36} color="white" style={playing ? undefined : { marginLeft: 4 }} />
            </TouchableOpacity>
            <Text style={styles.playLabel}>{playing ? 'Playing your message…' : 'Tap to play your message'}</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Ionicons name="mic-off-outline" size={28} color={Colors.inkFaint} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={styles.emptyText}>You haven&apos;t recorded a personal audio message yet.</Text>
            <TouchableOpacity style={styles.recordBtn} onPress={() => router.push('/audio-recording')} activeOpacity={0.85}>
              <Ionicons name="mic-outline" size={18} color="white" />
              <Text style={styles.recordBtnText}>Record One Now</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 8 }} />
      </ScrollView>

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
  scroll: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
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
  sectionLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: Radii.card,
    padding: 18,
    marginBottom: 24,
    ...Shadows.soft,
  },
  centerCard: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.cardTitle,
    color: Colors.ink,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.plum,
    marginTop: 6,
    flexShrink: 0,
  },
  tipText: {
    flex: 1,
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
    lineHeight: 19,
  },
  playBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 8,
    ...Shadows.pop,
  },
  playLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.secondary,
    color: Colors.inkSoft,
    textAlign: 'center',
    marginTop: 12,
  },
  emptyText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondary,
    color: Colors.inkSoft,
    textAlign: 'center',
    marginBottom: 16,
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.plum,
    borderRadius: Radii.btn,
    paddingVertical: 14,
  },
  recordBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.bodyMd,
    color: 'white',
  },
});
