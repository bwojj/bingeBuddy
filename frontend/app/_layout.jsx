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
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

function RootLayoutNav() {
    const { isAuthenticated } = useAuth();
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

        const inAuthGroup = segments[0] === '(auth)';

        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuthGroup) {
            router.replace('/(main)');
        }
    }, [isAuthenticated, segments]);

    return (
        <>
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
            {stillLoading && <LoadingScreen overlay />}
        </>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    );
}
