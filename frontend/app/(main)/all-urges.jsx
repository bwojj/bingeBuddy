import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { getAllUrges, deleteUrge } from '@/components/UrgeAPI';
import LoadingScreen from '@/components/LoadingScreen';
import { useAuth } from '@/context/AuthContext';
import { Colors, FontFamily, FontSize, Radii, Shadows, Gradients } from '@/constants/theme';

function formatDate(isoString) {
  return new Date(isoString)
    .toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    .toUpperCase();
}

export default function AllUrges() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { refreshUserData } = useAuth();
  const [urges, setUrges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setUrges(await getAllUrges());
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  async function handleDeleteUrge(id) {
    const ok = await deleteUrge(id);
    if (ok) {
      setUrges((prev) => prev.filter((u) => u.id !== id));
      // This screen's own "urges defeated" count recomputes locally from
      // `urges`, but the Me screen and milestone cards read urgeCount from
      // AuthContext -- without this they'd keep showing the pre-delete total.
      await refreshUserData();
    }
  }

  function confirmDeleteUrge(id) {
    Alert.alert(
      'Delete Urge',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteUrge(id) },
      ]
    );
  }

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
        <Text style={styles.topbarTitle}>Urges Defeated</Text>
        <View style={styles.backBtn} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <MaterialCommunityIcons name="trophy" size={28} color={Colors.plum} />
          <Text style={styles.summaryNumber}>{urges.length}</Text>
          <Text style={styles.summaryLabel}>URGES DEFEATED</Text>
        </View>

        {urges.map((u) => (
          <Swipeable
            key={u.id}
            containerStyle={styles.swipeableRow}
            renderRightActions={() => (
              <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => confirmDeleteUrge(u.id)}
                activeOpacity={0.8}
              >
                <View style={styles.deleteActionBg} />
                <Ionicons name="trash-outline" size={22} color="white" />
              </TouchableOpacity>
            )}
          >
            <View style={[styles.entryCard, styles.swipeableCard]}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>{formatDate(u.urge_time)}</Text>
                <View style={styles.badge}>
                  <Ionicons name="checkmark" size={12} color={Colors.sage} />
                </View>
              </View>
              {!!u.urge_note && <Text style={styles.entryNote}>{u.urge_note}</Text>}
            </View>
          </Swipeable>
        ))}

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

  /* Swipe-to-delete urge row -- the margin normally on entryCard moves here
     so the revealed delete action lines up flush with the card's edges */
  swipeableRow: {
    marginBottom: 12,
  },
  swipeableCard: {
    marginBottom: 0,
  },
  deleteAction: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionBg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -20,
    right: 0,
    backgroundColor: Colors.alert,
    borderTopRightRadius: Radii.card,
    borderBottomRightRadius: Radii.card,
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
  entryNote: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
    lineHeight: 19,
  },
});
