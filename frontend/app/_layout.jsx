import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import {
    Spectral_400Regular,
    Spectral_500Medium,
    Spectral_600SemiBold,
    Spectral_400Regular_Italic,
    Spectral_500Medium_Italic,
} from '@expo-google-fonts/spectral';
import {
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
} from '@expo-google-fonts/hanken-grotesk';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import { configurePurchases } from '../components/PurchasesAPI';
import { configureNotificationHandler } from '../lib/notifications';

configurePurchases();
configureNotificationHandler();

function RootLayoutNav() {
    const { isAuthenticated, userPreferences, userLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const [fontsLoaded, fontError] = useFonts({
        Spectral_400Regular,
        Spectral_500Medium,
        Spectral_600SemiBold,
        Spectral_400Regular_Italic,
        Spectral_500Medium_Italic,
        HankenGrotesk_400Regular,
        HankenGrotesk_500Medium,
        HankenGrotesk_600SemiBold,
        HankenGrotesk_700Bold,
        HankenGrotesk_800ExtraBold,
    });
    const stillLoading = isAuthenticated === null || (!fontsLoaded && !fontError);

    useEffect(() => {
        if (isAuthenticated === null) return; // still loading
        if (isAuthenticated && userLoading) return; // userPreferences not fetched yet -- avoid a premature recovery-intro bounce

        const inAuthGroup = segments[0] === '(auth)';
        const onRecoveryIntro = segments[0] === 'recovery-intro';

        if (!isAuthenticated && !inAuthGroup && !onRecoveryIntro) {
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuthGroup) {
            router.replace('/(main)');
        } else if (isAuthenticated && !userPreferences?.seen_recovery_intro && !onRecoveryIntro) {
            // Gates every authenticated user -- new or existing -- behind the
            // recovery intro until their UserData row shows they've seen it.
            router.replace('/recovery-intro');
        }
    }, [isAuthenticated, segments, userPreferences, userLoading]);

    return (
        <>
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
            {stillLoading && <LoadingScreen overlay />}
        </>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
                <AuthProvider>
                    <RootLayoutNav />
                </AuthProvider>
            </KeyboardProvider>
        </GestureHandlerRootView>
    );
}
