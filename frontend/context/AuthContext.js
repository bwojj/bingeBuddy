import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authenticated } from '../components/AuthApi';
import { getUserData, getUserCredentials } from '../components/DataAPI';
import { getUrgeCount, getUrgesByDay } from '../components/UrgeAPI';
import { delToken, getToken } from '../components/authStorage';

const BASEURL = 'https://bingebuddy-production.up.railway.app';

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
        setUserCredentials(creds?.[0] ?? null);
        setUserPreferences(pref?.[0] ?? null);
        setUrgeCount(count ?? 0);
        setUrgesByDay(days ?? EMPTY_BARS);
        setUserLoading(false);
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
