import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

function RootLayoutNav() {
    const { isAuthenticated } = useAuth();
    const segments = useSegments();
    const router = useRouter();

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
            {isAuthenticated === null && <LoadingScreen overlay />}
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
