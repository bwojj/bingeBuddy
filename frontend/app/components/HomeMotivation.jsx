import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'

const HomeMotivation = ({ userPreferences }) => {
  const router = useRouter();
  const imageUri = userPreferences?.motivation_image ?? null;
  const myWhy = userPreferences?.motivation ?? null;
  const [imageLoading, setImageLoading] = useState(!!imageUri);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push('/personalization')}
    >
      <View style={styles.imagePlaceholder} />
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
      )}
      {imageLoading && (
        <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" style={styles.loader} />
      )}
      <View style={styles.overlay} />

      {/* Edit hint */}
      <View style={styles.editBadge}>
        <Ionicons name="pencil" size={12} color="white" />
        <Text style={styles.editText}>Edit</Text>
      </View>

      {myWhy ? <Text style={styles.caption}>My Why: {myWhy}</Text> : null}
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
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -8,
    marginLeft: -8,
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
