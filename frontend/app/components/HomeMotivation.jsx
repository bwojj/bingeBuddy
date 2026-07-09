import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Colors, FontFamily, FontSize, Radii, Shadows } from '@/constants/theme'

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
      <LinearGradient
        colors={['transparent', 'rgba(37,24,38,0.55)']}
        style={styles.overlay}
      />

      {/* Motivation photo label */}
      <View style={styles.photoLabel}>
        <Text style={styles.photoLabelText}>MOTIVATION PHOTO</Text>
      </View>

      {/* Edit hint */}
      <View style={styles.editBadge}>
        <Ionicons name="pencil" size={12} color={Colors.plum} />
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
    borderRadius: Radii.card,
    overflow: 'hidden',
    height: 158,
    justifyContent: 'flex-end',
    backgroundColor: Colors.plumTint2,
    ...Shadows.card,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.plumTint2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -8,
    marginLeft: -8,
  },
  photoLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  photoLabelText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: Colors.plumSoft,
  },
  editBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  editText: {
    color: Colors.plum,
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.eyebrow,
  },
  caption: {
    color: 'white',
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.cardTitle,
    padding: 16,
  },
})
