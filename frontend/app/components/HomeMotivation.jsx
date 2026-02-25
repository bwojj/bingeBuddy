import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'

const HomeMotivation = ({ imageUri, myWhy }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push('/personalization')}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      <View style={styles.overlay} />

      {/* Edit hint */}
      <View style={styles.editBadge}>
        <Ionicons name="pencil" size={12} color="white" />
        <Text style={styles.editText}>Edit</Text>
      </View>

      <Text style={styles.caption}>
        {myWhy ? `My Why: ${myWhy}` : 'My Why: Being present for my kids.'}
      </Text>
    </TouchableOpacity>
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
    justifyContent: 'flex-end',
    backgroundColor: '#5a4235',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#5a4235',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  editBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  editText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  caption: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
  },
})
