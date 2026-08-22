import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usePostHog } from 'posthog-react-native';
import { authenticated } from '../components/AuthApi';
import { getUserData, getUserCredentials } from '../components/DataAPI';
import { getUrgeCount, getUrgesByDay } from '../components/UrgeAPI';
import { delToken, getToken } from '../components/authStorage';
import { identifyPurchasesUser, logOutPurchases } from '../components/PurchasesAPI';
import { clearLocalHabitState } from '../components/HabitAPI';
import { scheduleHabitReminder, cancelHabitReminder } from '../lib/notifications';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const EMPTY_BARS = ['M','T','W','T','F','S','S'].map(day => ({ day, count: 0 }));

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const posthog = usePostHog();
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userCredentials, setUserCredentials] = useState(null);
    const [userPreferences, setUserPreferences] = useState(null);
    const [urgeCount, setUrgeCount] = useState(0);
    const [urgesByDay, setUrgesByDay] = useState(EMPTY_BARS);
    const [userLoading, setUserLoading] = useState(true);

    const prevIsAuthenticatedRef = useRef(isAuthenticated);
    if (isAuthenticated && !prevIsAuthenticatedRef.current && !userLoading) {
        setUserLoading(true);
    }
    prevIsAuthenticatedRef.current = isAuthenticated;

    useEffect(() => {
        const checkAuth = async () => {
            const auth = await authenticated();
            setIsAuthenticated(!!auth);
        };
        checkAuth();
    }, []);

    const fetchData = useCallback(async () => {
        setUserLoading(true);
        const [creds, pref, count, days] = await Promise.all([
            getUserCredentials(),
            getUserData(),
            getUrgeCount(),
            getUrgesByDay(),
        ]);
        const credentials = creds?.[0] ?? null;
        const preferences = pref?.[0] ?? null;
        setUserCredentials(credentials);
        setUserPreferences(preferences);
        setUrgeCount(count ?? 0);
        setUrgesByDay(days ?? EMPTY_BARS);
        setUserLoading(false);
        if (credentials?.id) {
            identifyPurchasesUser(credentials.id).catch((error) => {
                console.warn('identifyPurchasesUser failed', error);
            });
            posthog?.identify(String(credentials.id), {
                email: credentials.email,
                username: credentials.username,
            });
        }

        if (preferences?.reminder_enabled && preferences?.reminder_time) {
            const [hours, minutes] = preferences.reminder_time.split(':').map(Number);
            scheduleHabitReminder(hours, minutes);
        } else {
            cancelHabitReminder();
        }
        return preferences;
    }, [posthog]);

    useEffect(() => {
        if (isAuthenticated === null) return;
        if (!isAuthenticated) {
            setUserLoading(false);
            return;
        }
        fetchData();
    }, [isAuthenticated, fetchData]);

    const logout = useCallback(async () => {
        const token = await getToken();
        try {
            await fetch(`${BASEURL}/api/logout`, {
                method: 'POST',
                headers: { 'Authorization': token ? `Bearer ${token}` : '' },
                credentials: 'include',
            });
        } catch (_) {}
        await delToken();
        await logOutPurchases();
        clearLocalHabitState();
        posthog?.reset();
        setIsAuthenticated(false);
        setUserCredentials(null);
        setUserPreferences(null);
        setUrgeCount(0);
        setUrgesByDay(EMPTY_BARS);
    }, [posthog]);

    return (
        <AuthContext.Provider value={{
            isAuthenticated, setIsAuthenticated,
            userCredentials, userPreferences,
            urgeCount, urgesByDay,
            userLoading, refreshUserData: fetchData, logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
