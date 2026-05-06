'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);  // Initialize as null (matches server)
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // This only runs on the client after hydration
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('auth_token');
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch('https://demo-dentist-main-adaeep.free.laravel.cloud/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                router.push('/admin');
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (err) {
            return { success: false, message: 'An error occurred during login' };
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
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
