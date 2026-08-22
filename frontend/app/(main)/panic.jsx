import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';
import { URGE_SCREEN_OPTIONS, markUrgeMethodVisited } from '@/constants/urgeScreenOptions';

const ENCOURAGEMENTS = [
  "You are stronger than this urge.",
  "This feeling will pass. You won't let it win.",
  "You've beaten this before — you can again.",
  "One moment doesn't define you.",
  "Breathe. You have the power here.",
  "You are not your urges.",
  "This urge is temporary. Your strength isn't.",
  "Pause. Breathe. Choose you.",
  "Every time you resist, you grow stronger.",
  "You showed up here — that's already a win.",
];

export default function Panic() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [message] = useState(() => ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Gradients.hero.colors}
        start={Gradients.hero.start}
        end={Gradients.hero.end}
        style={[styles.header, { paddingTop: insets.top + 40 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { top: insets.top }]}>
          <Ionicons name="chevron-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerMessage} numberOfLines={3}>{message}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionIntro}>Pick a tool to help you through this moment.</Text>

        {URGE_SCREEN_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={styles.optionBtn}
            activeOpacity={0.75}
            onPress={() => { markUrgeMethodVisited(opt.key); router.push(opt.route); }}
          >
            <View style={styles.optionIconWrap}>
              <Ionicons name={opt.icon} size={22} color={Colors.plum} />
            </View>
            <Text style={styles.optionLabel}>{opt.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.inkFaint} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.victoryBtn} onPress={() => router.push('/log-urge')} activeOpacity={0.85}>
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

  header: {
    minHeight: '13%',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMessage: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.heroTitle,
    color: 'white',
    lineHeight: 32,
    textAlign: 'center',
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },

  sectionIntro: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.secondary,
    color: Colors.inkSoft,
    textAlign: 'center',
    marginBottom: 20,
  },

  /* Option buttons */
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
    ...Shadows.card,
  },
  optionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    flex: 1,
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.body,
    color: Colors.ink,
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
    marginTop: 12,
    ...Shadows.pop,
  },
  victoryText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
    color: 'white',
  },
});
