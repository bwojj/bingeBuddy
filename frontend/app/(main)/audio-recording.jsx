import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { useAudioRecorder, useAudioPlayer, useAudioPlayerStatus, AudioModule, RecordingPresets } from 'expo-audio';
import { addPanicAudio, getPanicAudio } from '@/components/DataAPI';

const TIPS = [
  'Remind yourself why you want to stop binge eating.',
  'Describe how you feel right now — be honest and specific.',
  'Recall a moment when you stayed disciplined and how it felt.',
  'State your goals clearly: what you are working toward.',
  'Acknowledge that the urge is neurological noise, not a real need.',
];

export default function AudioRecording() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [hasExisting, setHasExisting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  const isPlaying = playerStatus.playing;

  useEffect(() => {
    getPanicAudio().then(url => setHasExisting(!!url));
    return () => {
      clearInterval(timerRef.current);
      player.remove();
    };
  }, []);

  async function startRecording() {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Required', 'Microphone access is needed to record audio.');
        return;
      }
      await AudioModule.setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
      setRecordedUri(null);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch (err) {
      Alert.alert('Error', 'Could not start recording. Please try again.');
    }
  }

  async function stopRecording() {
    clearInterval(timerRef.current);
    try {
      await audioRecorder.stop();
      await AudioModule.setAudioModeAsync({ allowsRecording: false });
      const uri = audioRecorder.uri;
      setRecordedUri(uri);
      player.replace({ uri });
    } catch (err) {
      Alert.alert('Error', 'Could not stop recording.');
    }
    setIsRecording(false);
  }

  async function playPreview() {
    if (!recordedUri) return;
    if (isPlaying) {
      player.pause();
      return;
    }
    player.seekTo(0);
    player.play();
  }

  async function handleSave() {
    if (!recordedUri) return;
    setUploading(true);
    const success = await addPanicAudio(recordedUri);
    setUploading(false);
    if (success) {
      Alert.alert('Saved', 'Your audio message has been saved. It will play during your SOS session.', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Error', 'Failed to save your recording. Please try again.');
    }
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 10 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Audio Message</Text>
          <View style={{ width: 40 }} />
        </View>

        {hasExisting && (
          <View style={styles.existingBanner}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.existingText}>You have a saved recording — record a new one to replace it.</Text>
          </View>
        )}

        {/* Tips Card */}
        <Text style={styles.sectionLabel}>RECORDING GUIDANCE</Text>
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="mic" size={18} color="#502c58" />
            <Text style={styles.cardTitle}>What to Say</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Speak to your future self in a moment of struggle. A heartfelt, personal message is far more powerful than a scripted one.
          </Text>
          {TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Recording Controls */}
        <Text style={styles.sectionLabel}>RECORDING</Text>
        <View style={styles.card}>
          {/* Timer */}
          <View style={styles.timerRow}>
            <View style={[styles.timerDot, isRecording && styles.timerDotActive]} />
            <Text style={styles.timerText}>{formatTime(duration)}</Text>
            {isRecording && <Text style={styles.recordingLabel}>Recording…</Text>}
          </View>

          {/* Record / Stop button */}
          <TouchableOpacity
            style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={30}
              color="white"
            />
            <Text style={styles.recordBtnLabel}>
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Text>
          </TouchableOpacity>

          {/* Playback preview */}
          {recordedUri && (
            <TouchableOpacity style={styles.previewBtn} onPress={playPreview} activeOpacity={0.75}>
              <Ionicons name={isPlaying ? 'stop-circle-outline' : 'play-circle-outline'} size={22} color="#502c58" />
              <Text style={styles.previewLabel}>{isPlaying ? 'Stop Preview' : 'Preview Recording'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Save Button */}
        {recordedUri && (
          <TouchableOpacity
            style={[styles.saveBtn, uploading && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={uploading}
            activeOpacity={0.85}
          >
            {uploading
              ? <ActivityIndicator color="white" />
              : <>
                  <Ionicons name="cloud-upload-outline" size={20} color="white" />
                  <Text style={styles.saveBtnText}>Save Recording</Text>
                </>
            }
          </TouchableOpacity>
        )}

        <View style={{ height: insets.bottom + 32 }} />
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
    paddingBottom: 20,
  },

  /* Header */
  header: {
    backgroundColor: '#502c58',
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
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },

  /* Existing banner */
  existingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e8f5e9',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  existingText: {
    flex: 1,
    fontSize: 13,
    color: '#2E7D32',
    lineHeight: 18,
  },

  /* Section Label */
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginBottom: 8,
  },

  /* Card */
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
    marginBottom: 14,
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
    backgroundColor: '#502c58',
    marginTop: 6,
    flexShrink: 0,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#444',
    lineHeight: 19,
  },

  /* Timer */
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  timerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
  },
  timerDotActive: {
    backgroundColor: '#C62828',
  },
  timerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    fontVariant: ['tabular-nums'],
  },
  recordingLabel: {
    fontSize: 13,
    color: '#C62828',
    fontWeight: '500',
  },

  /* Record button */
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#502c58',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
  },
  recordBtnActive: {
    backgroundColor: '#C62828',
  },
  recordBtnLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },

  /* Preview */
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#502c58',
    borderRadius: 12,
    paddingVertical: 12,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#502c58',
  },

  /* Save */
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});
