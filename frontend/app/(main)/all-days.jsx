import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getHabitDays } from '@/components/HabitAPI';
import LoadingScreen from '@/components/LoadingScreen';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';

// `dateStr` is a plain 'YYYY-MM-DD' local-calendar day from the backend --
// parsed manually (not `new Date(dateStr)`) so it isn't reinterpreted as a
// UTC midnight and shifted a day back in timezones behind UTC.
function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d)
    .toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    .toUpperCase();
}

export default function AllDays() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { streak } = useLocalSearchParams();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setDays(await getHabitDays());
        setLoading(false);
      })();
    }, [])
  );

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Gradients.hero.colors}
        start={Gradients.hero.start}
        end={Gradients.hero.end}
        style={[styles.topbar, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>All Days</Text>
        <View style={styles.backBtn} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Ionicons name="flame" size={28} color={Colors.plum} />
          <Text style={styles.summaryNumber}>{streak ?? 0}</Text>
          <Text style={styles.summaryLabel}>HABIT STREAK</Text>
        </View>

        {days.map((d) => {
          const complete = d.total > 0 && d.done === d.total;
          return (
            <View key={d.date} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>{formatDate(d.date)}</Text>
                {complete && (
                  <View style={styles.badge}>
                    <Ionicons name="checkmark" size={12} color={Colors.sage} />
                  </View>
                )}
              </View>
              <Text style={styles.entryProgress}>{d.done} / {d.total} habits done</Text>
            </View>
          );
        })}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  topbarTitle: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.topbarTitle,
    color: 'white',
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  /* Summary */
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    alignItems: 'center',
    padding: 22,
    marginBottom: 20,
    ...Shadows.card,
  },
  summaryNumber: {
    fontFamily: FontFamily.serifMedium,
    fontSize: 36,
    color: Colors.plum,
    marginTop: 8,
  },
  summaryLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.plum,
    letterSpacing: 1.4,
    marginTop: 4,
  },

  /* Entry cards */
  entryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    marginBottom: 12,
    padding: 16,
    ...Shadows.soft,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.inkFaint,
    letterSpacing: 0.6,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.sageTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryProgress: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
    lineHeight: 19,
  },
});
