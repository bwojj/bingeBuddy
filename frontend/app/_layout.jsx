import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
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
import { PostHogProvider } from 'posthog-react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import { configurePurchases } from '../components/PurchasesAPI';
import { configureNotificationHandler } from '../lib/notifications';

configurePurchases();
configureNotificationHandler();

// Keep the native splash screen (image only, no text) up until the custom
// fonts are loaded, so LoadingScreen never paints its first frame with an
// unresolved fontFamily -- that gap is what flashes as Apple's system font
// before swapping to Spectral/Hanken Grotesk on cold launch.
SplashScreen.preventAutoHideAsync().catch(() => {});

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
    const fontsReady = fontsLoaded || fontError;
    const stillLoading = isAuthenticated === null;

    useEffect(() => {
        if (fontsReady) SplashScreen.hideAsync();
    }, [fontsReady]);

    useEffect(() => {
        if (isAuthenticated === null) return; // still loading
        if (isAuthenticated && userLoading) return; // userPreferences not fetched yet -- avoid a premature onboarding bounce

        const inAuthGroup = segments[0] === '(auth)';
        const onLoginScreen = segments[0] === '(auth)' && segments[1] === 'login';

        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (isAuthenticated && !userPreferences?.onboarding_complete) {
            if (!inAuthGroup || onLoginScreen) router.replace('/(auth)/(onboarding)/verify-email');
        } else if (isAuthenticated && inAuthGroup) {
            router.replace('/(main)');
        }
    }, [isAuthenticated, segments, userPreferences, userLoading]);

    if (!fontsReady) {
        return null;
    }

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
            <PostHogProvider
                apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}
                options={{ host: process.env.EXPO_PUBLIC_POSTHOG_HOST, disableGeoip: true }}
                autocapture={{
                    captureTouches: true,
                    captureScreens: true,
                    captureLifecycleEvents: true,
                }}
            >
                <KeyboardProvider>
                    <AuthProvider>
                        <RootLayoutNav />
                    </AuthProvider>
                </KeyboardProvider>
            </PostHogProvider>
        </GestureHandlerRootView>
    );
}
