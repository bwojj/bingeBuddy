import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { logUrge } from '../../components/UrgeAPI';
import { useAuth } from '@/context/AuthContext';
import { getPanicAudio } from '@/components/DataAPI';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    getPanicAudio().then(url => setAudioUrl(url));
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  async function toggleAudio() {
    if (isPlaying) {
      await soundRef.current?.stopAsync();
      setIsPlaying(false);
      return;
    }
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      if (soundRef.current) await soundRef.current.unloadAsync();
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      soundRef.current = sound;
      setIsPlaying(true);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
        }
      });
    } catch {
      setIsPlaying(false);
    }
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
            <Ionicons name="close" size={22} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency Support</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Breathe Button */}
        <View style={styles.breatheSection}>
          <TouchableOpacity activeOpacity={0.85} style={styles.breatheOuter}>
            <View style={styles.breatheInner}>
              <MaterialCommunityIcons name="weather-windy" size={34} color="white" />
              <Text style={styles.breatheLabel}>BREATHE</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.breatheSubtitle}>Take a moment to center yourself</Text>
        </View>

        {/* 5 Steps to Reset */}
        <View style={styles.stepsCard}>
          <View style={styles.stepsHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#502c58" />
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

        {/* Personal Audio Message */}
        {audioUrl && (
          <TouchableOpacity style={styles.audioBtn} onPress={toggleAudio} activeOpacity={0.75}>
            <View style={styles.actionIconWrap}>
              <Ionicons name={isPlaying ? 'stop-circle' : 'headset'} size={26} color="#502c58" />
            </View>
            <Text style={styles.actionLabel}>{isPlaying ? 'Stop Message' : 'Play My Audio Message'}</Text>
          </TouchableOpacity>
        )}

        {/* Action Buttons */}
        <TouchableOpacity style={styles.journalBtn} onPress={() => router.push('/journal')} activeOpacity={0.75}>
          <View style={styles.actionIconWrap}>
            <Ionicons name="document-text" size={26} color="#502c58" />
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
    backgroundColor: '#f3edf7',
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
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSpacer: {
    width: 36,
  },

  /* Breathe section */
  breatheSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  breatheOuter: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: '#502c58',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  breatheInner: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#9C27B0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  breatheLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 2,
  },
  breatheSubtitle: {
    fontSize: 14,
    color: '#888',
    fontWeight: '400',
  },

  /* Steps card */
  stepsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  stepDivider: {
    height: 1,
    backgroundColor: '#f3edf7',
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
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#502c58',
    borderColor: '#502c58',
  },
  stepText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '400',
  },
  stepTextDone: {
    color: '#bbb',
    textDecorationLine: 'line-through',
  },

  /* Action buttons */
  audioBtn: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 20,
    gap: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  journalBtn: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f3edf7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
    textAlign: 'center',
  },

  /* Victory button */
  victoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  victoryText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});
