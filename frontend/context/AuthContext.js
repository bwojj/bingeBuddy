import { createContext, useContext, useState, useEffect } from 'react';
import { authenticated } from '../components/AuthApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = still loading

    useEffect(() => {
        const checkAuth = async () => {
            const auth = await authenticated();
            setIsAuthenticated(!!auth);
        };
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
