import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const HomeCheckInBox = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.checkInHeader}>Check-In</Text>
      <Text style={styles.checkInSubHeader}>How strong are your urges right now?</Text>
    </View>
  )
}

export default HomeCheckInBox

const styles = StyleSheet.create({
    container: {
        width: '90%', 
        height: '50%',
        backgroundColor: 'white', 
        borderRadius: 15,
        position: 'absolute',
        top: '22%',
        left: '5%',
    },
    checkInHeader: {
        left: 10, 
        top: 10, 
    },
    checkInSubHeader: {
        left: 10, 
        top: 13, 
    },
})