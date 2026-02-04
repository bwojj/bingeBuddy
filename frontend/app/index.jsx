import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import HomeCheckInBox from './components/HomeCheckInBox'

// Dashboard / Home

export default function Index() {

  const insets = useSafeAreaInsets();
  return (
    <>
      <View style={[styles.backgroundView, {paddingTop: insets.top}]} />
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.headerText}>Good Morning, Blake!</Text>
          <Text style={styles.headerSubText}>Tuesday, Feb 3</Text>
        </View>
        <HomeCheckInBox/>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundView: {
    backgroundColor: '#8c03fc', 
  },
  header: {
    backgroundColor: '#8c03fc', 
    paddingLeft: 10, 
    paddingTop: 20,
    height: '45%', 
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    display: 'flex',

    gap: '10px', 
    marginTop: -60, 
  },
  headerText: {
    color: 'white', 
    fontSize: 20,
  },
  headerSubText: {
    color: 'white', 
    fontSize: 14,
  }
})