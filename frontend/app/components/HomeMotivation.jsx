import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const HomeMotivation = () => {
  return (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
        <View style={styles.overlay} />
        <Text style={styles.caption}>My Why: Being present for my kids.</Text>
      </View>
    </View>
  )
}

export default HomeMotivation

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#5a4235',
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  caption: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
  },
})
