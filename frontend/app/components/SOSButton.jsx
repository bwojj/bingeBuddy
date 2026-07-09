import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Gradients, Shadows } from '@/constants/theme';

export default function SOSButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.wrap}
      onPress={() => router.push('/panic')}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={Gradients.sos.colors}
        start={Gradients.sos.start}
        end={Gradients.sos.end}
        style={styles.gradient}
      >
        <MaterialCommunityIcons name="lifebuoy" size={20} color="white" />
        <Text style={styles.label}>SOS</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 16,
    bottom: 106,
    width: 58,
    height: 58,
    borderRadius: 19,
    zIndex: 20,
    ...Shadows.pop,
  },
  gradient: {
    flex: 1,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  label: {
    color: 'white',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
