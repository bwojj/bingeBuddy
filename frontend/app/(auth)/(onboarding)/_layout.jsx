import { Stack } from 'expo-router'


const OnboardingLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="verify-email" options={{ headerShown: false }} />
            <Stack.Screen name="maincause" options={{ headerShown: false }} />
            <Stack.Screen name="coachingstyle" options={{ headerShown: false }} />
            <Stack.Screen name="motivation" options={{ headerShown: false }} />
        </Stack>
    );
}

export default OnboardingLayout;