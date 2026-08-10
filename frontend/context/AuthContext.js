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

    // login.jsx/motivation.jsx/SocialAuthButtons.jsx call setIsAuthenticated(true)
    // directly, before userPreferences has been (re)fetched for the new
    // session. Without this, there's a one-render window where isAuthenticated
    // is already true but userLoading/userPreferences are still stale from the
    // prior logged-out state (userLoading false, userPreferences null) --
    // the root layout's redirect gate reads that as onboarding_complete being
    // false and briefly flashes the user to verify-email before the real
    // fetch (kicked off by the effect below) resolves. Marking userLoading
    // true synchronously during render, in the same render isAuthenticated
    // flips true, closes that window instead of waiting a render for the effect.
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
        // Re-syncs the on-device reminder schedule to match the account's saved
        // preference on every login/refresh -- restores it after reinstall/new
        // device, and self-corrects a stale schedule left by a different
        // account on a shared device (fixed notification identifier).
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
