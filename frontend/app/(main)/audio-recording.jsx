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
import { useAudioRecorder, useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync, requestRecordingPermissionsAsync, RecordingPresets } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { addPanicAudio, getPanicAudio, deletePanicAudio } from '@/components/DataAPI';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';

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

  const [existingUrl, setExistingUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Player for the saved recording on the server
  const savedPlayer = useAudioPlayer(existingUrl ? { uri: existingUrl } : null);
  const savedStatus = useAudioPlayerStatus(savedPlayer);
  const savedPlaying = savedStatus.playing;

  // Player for the freshly recorded preview
  const previewPlayer = useAudioPlayer(recordedUri ? { uri: recordedUri } : null);
  const previewStatus = useAudioPlayerStatus(previewPlayer);
  const previewPlaying = previewStatus.playing;

  useEffect(() => {
    getPanicAudio().then(url => setExistingUrl(url));
    return () => { clearInterval(timerRef.current); };
  }, []);

  async function startRecording() {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Required', 'Microphone access is needed to record audio.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
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
      await setAudioModeAsync({ allowsRecording: false });
      setRecordedUri(audioRecorder.uri);
    } catch (err) {
      Alert.alert('Error', 'Could not stop recording.');
    }
    setIsRecording(false);
  }

  function toggleSavedPlayback() {
    if (savedPlaying) {
      savedPlayer.pause();
    } else {
      savedPlayer.seekTo(0);
      savedPlayer.play();
    }
  }

  function handleDelete() {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete your saved audio message? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            setDeleting(true);
            const success = await deletePanicAudio();
            setDeleting(false);
            if (success) {
              setExistingUrl(null);
            } else {
              Alert.alert('Error', 'Could not delete the recording. Please try again.');
            }
          },
        },
      ]
    );
  }

  async function playPreview() {
    if (!recordedUri) return;
    if (previewPlaying) {
      previewPlayer.pause();
      return;
    }
    previewPlayer.seekTo(0);
    previewPlayer.play();
  }

  async function handleSave() {
    if (!recordedUri) return;
    setUploading(true);
    const success = await addPanicAudio(recordedUri);
    setUploading(false);
    if (success) {
      const url = await getPanicAudio();
      setExistingUrl(url);
      setRecordedUri(null);
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
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <LinearGradient
          colors={Gradients.hero.colors}
          start={Gradients.hero.start}
          end={Gradients.hero.end}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Audio Message</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        {/* Saved Recording */}
        {existingUrl && (
          <>
            <Text style={styles.sectionLabel}>SAVED RECORDING</Text>
            <View style={styles.card}>
              <View style={styles.savedRow}>
                <View style={[styles.savedIconWrap]}>
                  <Ionicons name="mic" size={20} color={Colors.plum} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.savedTitle}>Your Audio Message</Text>
                  <Text style={styles.savedSub}>Plays on your SOS screen</Text>
                </View>
                <TouchableOpacity style={styles.savedPlayBtn} onPress={toggleSavedPlayback} activeOpacity={0.75}>
                  <Ionicons name={savedPlaying ? 'pause' : 'play'} size={20} color={Colors.plum} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.savedDeleteBtn}
                  onPress={handleDelete}
                  disabled={deleting}
                  activeOpacity={0.75}
                >
                  {deleting
                    ? <ActivityIndicator size="small" color={Colors.alert} />
                    : <Ionicons name="trash-outline" size={20} color={Colors.alert} />}
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* Tips Card */}
        <Text style={styles.sectionLabel}>RECORDING GUIDANCE</Text>
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="mic" size={18} color={Colors.plum} />
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
              <Ionicons name={previewPlaying ? 'stop-circle-outline' : 'play-circle-outline'} size={22} color={Colors.plum} />
              <Text style={styles.previewLabel}>{previewPlaying ? 'Stop Preview' : 'Preview Recording'}</Text>
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
    backgroundColor: Colors.plumDeep,
  },
  scroll: {
    flexGrow: 1,
    backgroundColor: Colors.bg,
    paddingBottom: 20,
  },

  /* Header */
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

  /* Saved recording card */
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savedIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedTitle: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.bodyMd,
    color: Colors.ink,
  },
  savedSub: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.eyebrow,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  savedPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.alertTint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Section Label */
  sectionLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginBottom: 8,
  },

  /* Card */
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: Radii.card,
    padding: 18,
    marginBottom: 24,
    ...Shadows.soft,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.cardTitle,
    color: Colors.ink,
  },
  cardSubtitle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
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
    backgroundColor: Colors.line,
  },
  timerDotActive: {
    backgroundColor: Colors.alert,
  },
  timerText: {
    fontFamily: FontFamily.serifMedium,
    fontSize: 22,
    color: Colors.ink,
    fontVariant: ['tabular-nums'],
  },
  recordingLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.secondarySm,
    color: Colors.alert,
  },

  /* Record button */
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.plum,
    borderRadius: Radii.btn,
    paddingVertical: 16,
    marginBottom: 12,
  },
  recordBtnActive: {
    backgroundColor: Colors.alert,
  },
  recordBtnLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
    color: 'white',
  },

  /* Preview */
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.plum,
    borderRadius: 12,
    paddingVertical: 12,
  },
  previewLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.bodyMd,
    color: Colors.plum,
  },

  /* Save */
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.plum,
    marginHorizontal: 20,
    borderRadius: Radii.btn,
    paddingVertical: 16,
    ...Shadows.pop,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
    color: 'white',
  },
});
