import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authenticated } from '../components/AuthApi';
import { getUserData, getUserCredentials } from '../components/DataAPI';
import { getUrgeCount, getUrgesByDay } from '../components/UrgeAPI';
import { delToken, getToken } from '../components/authStorage';
import { identifyPurchasesUser, logOutPurchases } from '../components/PurchasesAPI';
import { scheduleHabitReminder, cancelHabitReminder } from '../lib/notifications';

const BASEURL = process.env.EXPO_PUBLIC_API_URL;

const EMPTY_BARS = ['M','T','W','T','F','S','S'].map(day => ({ day, count: 0 }));

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userCredentials, setUserCredentials] = useState(null);
    const [userPreferences, setUserPreferences] = useState(null);
    const [urgeCount, setUrgeCount] = useState(0);
    const [urgesByDay, setUrgesByDay] = useState(EMPTY_BARS);
    const [userLoading, setUserLoading] = useState(true);

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
            identifyPurchasesUser(credentials.id).catch(() => {});
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
    }, []);

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
        setIsAuthenticated(false);
        setUserCredentials(null);
        setUserPreferences(null);
        setUrgeCount(0);
        setUrgesByDay(EMPTY_BARS);
    }, []);

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
