import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{headerStyle: 'none'}}>
      <Stack.Screen name="index" options={{title: 'Home', headerShown: false}}/>
      <Stack.Screen name="settings" options={{title: 'Settings', headerShown: false}}/>
      <Stack.Screen name="coach" options={{title: 'Coach', headerShown: false}}/>
      <Stack.Screen name="journal" options={{title: 'Journal', headerShown: false}}/>
      <Stack.Screen name="panic" options={{title: 'Panic', headerShown: false}}/>
      <Stack.Screen name="progress" options={{title: 'Progress', headerShown: false}}/>
      <Stack.Screen name="tracker" options={{title: 'Tracker', headerShown: false}}/>
    </Stack>
  )
}
