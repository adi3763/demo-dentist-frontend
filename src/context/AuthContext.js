'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

function readStoredAuthUser() {
    const storedUser =
        localStorage.getItem('user') || sessionStorage.getItem('user');
    const token =
        localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

    if (!storedUser || !token) {
        return null;
    }

    try {
        return JSON.parse(storedUser);
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);  // Initialize as null (matches server)
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setUser(readStoredAuthUser());
            setLoading(false);
        });

        return () => cancelAnimationFrame(frame);
    }, []);

    const login = async (email, password, options = {}) => {
        const { rememberMe = true } = options;
        try {
            const res = await fetch('https://demo-dentist-main-adaeep.free.laravel.cloud/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                const storage = rememberMe ? localStorage : sessionStorage;
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('auth_token');
                sessionStorage.removeItem('user');
                storage.setItem('auth_token', data.token);
                storage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                router.push('/admin');
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, message: 'An error occurred during login' };
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user');
        setUser(null);
        router.push('/admin/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
