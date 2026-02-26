import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authenticated } from '../components/AuthApi';
import { getUserData, getUserCredentials } from '../components/DataAPI'; 

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userCredentials, setUserCredentials] = useState(null);
    const [userPreferences, setUserPreferences] = useState(null);
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
        const [creds, pref] = await Promise.all([getUserCredentials(), getUserData()]);
        setUserCredentials(creds?.[0] ?? null);
        setUserPreferences(pref?.[0] ?? null);
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

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, userCredentials, userPreferences, userLoading, refreshUserData: fetchData }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
