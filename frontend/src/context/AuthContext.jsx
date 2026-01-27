import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup, logout as apiLogout, getCurrentUser, refreshToken } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing token on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const userData = await getCurrentUser();
                    setUser(userData);
                } catch (err) {
                    // Token expired or invalid, try refresh
                    try {
                        const refreshed = await refreshToken();
                        if (refreshed) {
                            const userData = await getCurrentUser();
                            setUser(userData);
                        }
                    } catch (refreshErr) {
                        // Refresh failed, clear tokens
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                    }
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = useCallback(async (email, password) => {
        setError(null);
        try {
            const tokens = await apiLogin(email, password);
            localStorage.setItem('access_token', tokens.access_token);
            localStorage.setItem('refresh_token', tokens.refresh_token);
            const userData = await getCurrentUser();
            setUser(userData);
            return true;
        } catch (err) {
            setError(err.message || 'Login failed');
            return false;
        }
    }, []);

    const signup = useCallback(async (email, username, password) => {
        setError(null);
        try {
            await apiSignup(email, username, password);
            return true;
        } catch (err) {
            setError(err.message || 'Signup failed');
            return false;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiLogout();
        } catch (err) {
            // Ignore logout errors
        }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    }, []);

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        signup,
        logout,
        setError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
