import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoadingScreen({ overlay = false }) {
  const iconScale = useRef(new Animated.Value(0.88)).current;
  const dot1Opacity = useRef(new Animated.Value(0.25)).current;
  const dot2Opacity = useRef(new Animated.Value(0.25)).current;
  const dot3Opacity = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    // Icon gentle pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconScale, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(iconScale, { toValue: 0.88, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    // Sequential dot wave
    const dotWave = Animated.loop(
      Animated.sequence([
        Animated.timing(dot1Opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(dot2Opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(dot3Opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.delay(250),
        Animated.parallel([
          Animated.timing(dot1Opacity, { toValue: 0.25, duration: 200, useNativeDriver: true }),
          Animated.timing(dot2Opacity, { toValue: 0.25, duration: 200, useNativeDriver: true }),
          Animated.timing(dot3Opacity, { toValue: 0.25, duration: 200, useNativeDriver: true }),
        ]),
        Animated.delay(100),
      ])
    );
    dotWave.start();

    return () => dotWave.stop();
  }, []);

  return (
    <View style={[styles.container, overlay && styles.overlay]}>
      {/* Soft radial glow behind icon */}
      <View style={styles.glowRing} />
      <View style={styles.glowRingInner} />

      {/* Icon */}
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: iconScale }] }]}>
        <MaterialCommunityIcons name="heart-pulse" size={48} color="white" />
      </Animated.View>

      {/* App name */}
      <Text style={styles.appName}>BingeBuddy</Text>
      <Text style={styles.tagline}>Your recovery, your journey</Text>

      {/* Animated dots */}
      <View style={styles.dotsRow}>
        <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7B1FA2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },

  /* Decorative glow rings */
  glowRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  glowRingInner: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  /* Icon */
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },

  /* Text */
  appName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    letterSpacing: 0.3,
  },

  /* Dots */
  dotsRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 48,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
});
