import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { logUrge } from '../../components/UrgeAPI';
import { useAuth } from '@/context/AuthContext';
import { getPanicAudio } from '@/components/DataAPI';
import { Colors, FontFamily, FontSize, Radii, Shadows } from '@/constants/theme';

const STEPS = [
  "Acknowledge the urge as JUNK",
  "Seperate your higher brain from the urge",
  "Do not REACT",
  "Do not ACT",
  "Celebrate!",
];

export default function Panic() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { refreshUserData } = useAuth();
  const [checked, setChecked] = useState(Array(STEPS.length).fill(false));
  const [audioUrl, setAudioUrl] = useState(null);

  const player = useAudioPlayer(audioUrl ? { uri: audioUrl } : null);
  const playerStatus = useAudioPlayerStatus(player);
  const isPlaying = playerStatus.playing;

  useEffect(() => {
    getPanicAudio().then(url => setAudioUrl(url));
  }, []);

  async function toggleAudio() {
    if (isPlaying) {
      player.pause();
      return;
    }
    player.seekTo(0);
    player.play();
  }

  function toggleStep(i) {
    setChecked(prev => prev.map((v, idx) => idx === i ? !v : v));
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency Support</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Personal Audio Message — top of screen */}
        {audioUrl ? (
          <TouchableOpacity style={styles.audioBtn} onPress={toggleAudio} activeOpacity={0.75}>
            <View style={styles.actionIconWrap}>
              <Ionicons name={isPlaying ? 'stop-circle' : 'headset'} size={25} color={Colors.plum} />
            </View>
            <Text style={styles.actionLabel}>{isPlaying ? 'Stop Message' : 'Play My Audio Message'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.audioBtn} onPress={() => router.push('/audio-recording')} activeOpacity={0.75}>
            <View style={styles.actionIconWrap}>
              <Ionicons name="mic-outline" size={25} color={Colors.plum} />
            </View>
            <Text style={styles.actionLabel}>Record a Personal Audio Message</Text>
          </TouchableOpacity>
        )}

        {/* 5 Steps to Reset */}
        <View style={styles.stepsCard}>
          <View style={styles.stepsHeader}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.plum} />
            <Text style={styles.stepsTitle}>5 Steps to Reset</Text>
          </View>

          {STEPS.map((step, i) => (
            <View key={i}>
              {i > 0 && <View style={styles.stepDivider} />}
              <TouchableOpacity
                style={styles.stepRow}
                onPress={() => toggleStep(i)}
                activeOpacity={0.65}
              >
                <View style={[styles.checkbox, checked[i] && styles.checkboxChecked]}>
                  {checked[i] && <Ionicons name="checkmark" size={12} color="white" />}
                </View>
                <Text style={[styles.stepText, checked[i] && styles.stepTextDone]}>
                  {i + 1}. {step}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.journalBtn} onPress={() => router.push('/journal')} activeOpacity={0.75}>
          <View style={styles.actionIconWrap}>
            <Ionicons name="book-outline" size={25} color={Colors.plum} />
          </View>
          <Text style={styles.actionLabel}>Open Journal</Text>
        </TouchableOpacity>

        {/* Victory button */}
        <TouchableOpacity style={styles.victoryBtn} onPress={async () => { await logUrge(); await refreshUserData(); router.back(); }} activeOpacity={0.85}>
          <MaterialCommunityIcons name="trophy" size={20} color="white" />
          <Text style={styles.victoryText}>I Have Beaten the Urge</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.topbarTitle,
    color: Colors.ink,
  },
  headerSpacer: {
    width: 36,
  },

  /* Steps card */
  stepsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: 20,
    marginBottom: 16,
    ...Shadows.card,
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  stepsTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.cardTitle,
    color: Colors.ink,
  },
  stepDivider: {
    height: 1,
    backgroundColor: Colors.line,
    marginLeft: 38,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#cabfce',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  checkboxChecked: {
    backgroundColor: Colors.plum,
    borderColor: Colors.plum,
  },
  stepText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
  },
  stepTextDone: {
    color: Colors.inkFaint,
    textDecorationLine: 'line-through',
  },

  /* Action buttons */
  audioBtn: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    paddingVertical: 20,
    gap: 11,
    marginBottom: 12,
    ...Shadows.card,
  },
  journalBtn: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    paddingVertical: 20,
    gap: 11,
    ...Shadows.card,
  },
  actionIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.secondary,
    color: Colors.inkSoft,
    textAlign: 'center',
  },

  /* Victory button */
  victoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.plum,
    borderRadius: Radii.btn,
    paddingVertical: 18,
    marginTop: 20,
    ...Shadows.pop,
  },
  victoryText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
    color: 'white',
  },
});
