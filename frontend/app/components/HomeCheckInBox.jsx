import { StyleSheet, Text, View, TouchableOpacity, PanResponder, Alert } from 'react-native'
import React, { useState, useRef, useCallback } from 'react'

const MIN = 1;
const MAX = 10;

function getEmoji(value) {
  if (value <= 2) return '😊';
  if (value <= 4) return '😐';
  if (value <= 6) return '😟';
  if (value <= 8) return '😣';
  return '😡';
}

const HomeCheckInBox = () => {
  const [urgeLevel, setUrgeLevel] = useState(3);
  const sliderWidth = useRef(0);
  const currentValue = useRef(urgeLevel);

  const clampedPercent = (urgeLevel - MIN) / (MAX - MIN);

  const updateFromX = useCallback((x) => {
    const w = sliderWidth.current;
    if (!w) return;
    const raw = Math.round((x / w) * (MAX - MIN) + MIN);
    const clamped = Math.min(MAX, Math.max(MIN, raw));
    currentValue.current = clamped;
    setUrgeLevel(clamped);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        updateFromX(e.nativeEvent.locationX);
      },
      onPanResponderMove: (e) => {
        updateFromX(e.nativeEvent.locationX);
      },
    })
  ).current;

  const handleLogUrge = () => {
    Alert.alert(
      'Urge Logged',
      `Intensity ${urgeLevel}/10 recorded. Stay strong — this urge will pass.`,
      [{ text: 'Thanks', style: 'default' }]
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Check-In</Text>
      <Text style={styles.subtitle}>How strong are your urges right now?</Text>

      {/* Level indicator */}
      <View style={styles.levelRow}>
        <Text style={styles.levelEmoji}>{getEmoji(urgeLevel)}</Text>
        <Text style={styles.levelNumber}>{urgeLevel}</Text>
        <Text style={styles.levelLabel}> / 10</Text>
      </View>

      {/* Interactive Slider track */}
      <View style={styles.sliderContainer}>
        <View
          style={styles.sliderTrack}
          onLayout={(e) => { sliderWidth.current = e.nativeEvent.layout.width; }}
          {...panResponder.panHandlers}
        >
          <View style={[styles.sliderFill, { width: `${clampedPercent * 100}%` }]} />
          <View style={[styles.sliderThumb, { left: `${clampedPercent * 100}%`, marginLeft: -10 }]} />
        </View>
      </View>

      {/* Number scale */}
      <View style={styles.scaleRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <TouchableOpacity key={n} onPress={() => setUrgeLevel(n)}>
            <Text style={[styles.scaleNumber, urgeLevel === n && styles.scaleNumberActive]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Log Urge button */}
      <TouchableOpacity style={styles.button} onPress={handleLogUrge} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Log Urge</Text>
      </TouchableOpacity>
    </View>
  )
}

export default HomeCheckInBox

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 14,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  levelEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  levelNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7B1FA2',
  },
  levelLabel: {
    fontSize: 16,
    color: '#999',
    marginTop: 4,
  },
  sliderContainer: {
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sliderTrack: {
    height: 22,
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 8,
    height: 6,
    backgroundColor: '#7B1FA2',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: 1,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7B1FA2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  scaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  scaleNumber: {
    fontSize: 13,
    color: '#ccc',
    fontWeight: '500',
    width: 22,
    textAlign: 'center',
  },
  scaleNumberActive: {
    color: '#7B1FA2',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#7B1FA2',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
