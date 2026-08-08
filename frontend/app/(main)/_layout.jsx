import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 200 }}>
      <Stack.Screen name="index" options={{title: 'Home'}}/>
      <Stack.Screen name="settings" options={{title: 'Settings'}}/>
      <Stack.Screen name="verify-email" options={{title: 'Verify Email'}}/>
      <Stack.Screen name="me" options={{title: 'Me'}}/>
      <Stack.Screen name="coach" options={{title: 'Coach'}}/>
      <Stack.Screen name="ai-coach-intro" options={{title: 'Meet Your Coach'}}/>
      <Stack.Screen name="paywall" options={{title: 'Unlock AI Coach'}}/>
      <Stack.Screen name="manage-memory" options={{title: 'Manage Memory'}}/>
      <Stack.Screen name="journal" options={{title: 'Journal'}}/>
      <Stack.Screen name="panic" options={{title: 'Panic'}}/>
      <Stack.Screen name="log-urge" options={{title: 'Urge Logged'}}/>
      <Stack.Screen name="all-urges" options={{title: 'Urges Defeated'}}/>
      <Stack.Screen name="tracker" options={{title: 'Tracker'}}/>
      <Stack.Screen name="personalization" options={{title: 'Personalization'}}/>
      <Stack.Screen name="my-plan" options={{title: 'My Recovery'}}/>
      <Stack.Screen name="audio-recording" options={{title: 'Personal Audio Message'}}/>
      <Stack.Screen name="mental-frameworks" options={{title: 'Mental Frameworks'}}/>
      <Stack.Screen name="actions-to-take" options={{title: 'Actions to Take'}}/>
      <Stack.Screen name="listen-recording" options={{title: 'Listen to Recording'}}/>
      <Stack.Screen name="urge-surfing" options={{title: 'Urge Surfing'}}/>
      <Stack.Screen name="urge-coach" options={{title: 'AI Coach'}}/>
      <Stack.Screen name="urge-check-in" options={{title: 'Check In'}}/>
      <Stack.Screen name="lost-control" options={{title: 'Lost Control'}}/>
    </Stack>
  )
}
