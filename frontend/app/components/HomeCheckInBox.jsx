import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const HomeCheckInBox = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Check-In</Text>
      <Text style={styles.subtitle}>How strong are your urges right now?</Text>

      {/* Slider track */}
      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack}>
          <View style={styles.sliderFill} />
          <View style={styles.sliderThumb} />
        </View>
      </View>

      {/* Number scale with emoji faces */}
      <View style={styles.scaleRow}>
        <Text style={styles.emoji}>😊</Text>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <Text key={n} style={styles.scaleNumber}>{n}</Text>
        ))}
        <Text style={styles.emoji}>😡</Text>
      </View>

      {/* Log Urge button */}
      <View style={styles.button}>
        <Text style={styles.buttonText}>Log Urge</Text>
      </View>
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
    marginBottom: 18,
  },
  sliderContainer: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#e0d4e8',
    borderRadius: 3,
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '30%',
    backgroundColor: '#7B1FA2',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    left: '28%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7B1FA2',
    top: -7,
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
  },
  emoji: {
    fontSize: 22,
  },
  scaleNumber: {
    fontSize: 13,
    color: '#7B1FA2',
    fontWeight: '600',
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
