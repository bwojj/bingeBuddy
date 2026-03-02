import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 200 }}>
      <Stack.Screen name="index" options={{title: 'Home'}}/>
      <Stack.Screen name="settings" options={{title: 'Settings'}}/>
      <Stack.Screen name="coach" options={{title: 'Coach'}}/>
      <Stack.Screen name="journal" options={{title: 'Journal'}}/>
      <Stack.Screen name="panic" options={{title: 'Panic'}}/>
      <Stack.Screen name="progress" options={{title: 'Progress'}}/>
      <Stack.Screen name="tracker" options={{title: 'Tracker'}}/>
      <Stack.Screen name="personalization" options={{title: 'Personalization'}}/>
    </Stack>
  )
}
