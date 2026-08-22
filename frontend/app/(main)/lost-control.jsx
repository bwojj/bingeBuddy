import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Radii, Shadows } from '@/constants/theme';

const AVOID = [
  "Do not forcefully restrict",
  "Do not overdo cardio",
  "Don't make promises to be perfect",
  "Do not hyperfixate on this event",
];

const INSTEAD = [
  "Follow your normal daily plan",
  "Be mindful — focus on the present",
  "Drink some water",
  "Go for a walk",
  "Journal this experience, and learn from it",
];


export default function LostControl() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backPill}>
          <Ionicons name="chevron-back" size={22} color={Colors.plum} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>The Past Cannot Be Changed</Text>
        <Text style={styles.subtitle}>
          Whatever happened, your progress is fine. How you respond is infinitely more important.
        </Text>

        <Text style={styles.sectionLabel}>WHAT NOT TO DO</Text>
        <View style={[styles.card, styles.avoidCard]}>
          {AVOID.map((item, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipDot, styles.avoidDot]} />
              <Text style={styles.tipText}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>WHAT TO DO INSTEAD</Text>
        <View style={[styles.card, styles.insteadCard]}>
          {INSTEAD.map((item, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipDot, styles.insteadDot]} />
              <Text style={styles.tipText}>{item}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.journalBtn} onPress={() => router.push('/journal')} activeOpacity={0.85}>
          <Ionicons name="book-outline" size={20} color="white" />
          <Text style={styles.journalBtnText}>Go to Journal</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.bg,
  },
  backPill: {
    width: 40,
    height: 40,
    borderRadius: Radii.pill / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    ...Shadows.soft,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.flowTitle,
    color: Colors.ink,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.body,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  sectionLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  card: {
    borderRadius: Radii.card,
    padding: 18,
    marginBottom: 24,
    borderLeftWidth: 4,
    ...Shadows.soft,
  },
  avoidCard: {
    backgroundColor: Colors.alertTint,
    borderLeftColor: Colors.alert,
  },
  insteadCard: {
    backgroundColor: Colors.sageTint,
    borderLeftColor: Colors.sage,
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
    marginTop: 6,
    flexShrink: 0,
  },
  avoidDot: {
    backgroundColor: Colors.alert,
  },
  insteadDot: {
    backgroundColor: Colors.sage,
  },
  tipText: {
    flex: 1,
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
    lineHeight: 19,
  },
  journalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.plum,
    borderRadius: Radii.btn,
    paddingVertical: 18,
    marginTop: 8,
    ...Shadows.pop,
  },
  journalBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
    color: 'white',
  },
});
