import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, FontSize, Radii, Shadows } from '@/constants/theme';

// Single-stat card shared by the dashboard (urges defeated) and My Recovery
// (habit streak). `onPress` is optional — My Recovery is already the
// destination this card would link to, so it renders inert there.
export default function ConsistencyCard({ mode, urgeCount, dayStreak, bestStreak, onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const isStreak = mode === 'streak';
  const Icon = isStreak
    ? <Ionicons name="flame" size={26} color={Colors.plum} />
    : <MaterialCommunityIcons name="trophy" size={24} color={Colors.plum} />;

  return (
    <Wrapper
      style={styles.card}
      {...(onPress ? { onPress, activeOpacity: 0.9 } : {})}
    >
      <LinearGradient
        colors={[Colors.surface, Colors.plumTint2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.watermarkWrap}>
        {isStreak
          ? <Ionicons name="flame" size={128} color="rgba(91,46,107,0.06)" />
          : <MaterialCommunityIcons name="trophy" size={118} color="rgba(91,46,107,0.06)" />}
      </View>

      <View style={styles.content}>
        <View style={styles.iconBadge}>{Icon}</View>
        <View style={styles.textCol}>
          <Text style={styles.statNumber}>{isStreak ? dayStreak : urgeCount}</Text>
          <Text style={styles.statLabel}>{isStreak ? 'HABIT STREAK' : 'URGES DEFEATED'}</Text>
          <Text style={styles.statSubtext}>
            {isStreak ? `Best streak: ${bestStreak} days` : 'Every urge beaten counts.'}
          </Text>
        </View>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.card,
    marginHorizontal: 20,
    marginTop: 16,
    overflow: 'hidden',
    ...Shadows.card,
  },
  watermarkWrap: {
    position: 'absolute',
    right: -22,
    bottom: -28,
    transform: [{ rotate: '-12deg' }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  statNumber: {
    fontFamily: FontFamily.serifMedium,
    fontSize: 48,
    color: Colors.plum,
  },
  statLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.eyebrowSm,
    color: Colors.plum,
    letterSpacing: 1.4,
    marginTop: -8,
  },
  statSubtext: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.eyebrow,
    color: Colors.inkSoft,
    marginTop: 2,
  },
});
