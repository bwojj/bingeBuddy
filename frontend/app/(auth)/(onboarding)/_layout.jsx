import { Stack } from 'expo-router'


const OnboardingLayout = () => {
    return (
        <Stack headerOptions={{ headerShown: false }}>
            <Stack.Screen name="maincause" options={{title: 'Cause', headerShown: false}}/>
            <Stack.Screen name="taught" options={{title: 'Coaching Style', headerShown: false}}/>
            <Stack.Screen name="motivation" options={{title: 'Motivation', headerShown: false}}/>
        </Stack>
    );
}

export default OnboardingLayout; 