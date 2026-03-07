import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { usuarioApi } from '../api/usuarios';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const currentUser = await usuarioApi.me();
            setUser(currentUser);
        } catch (err) {
            setUser(null);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            await refreshUser();
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username: string, password: string) => {
        const userData = await usuarioApi.login({ username, password });
        setUser(userData);
    };

    const logout = async () => {
        try {
            await usuarioApi.logout();
        } catch (err) {
            console.error("Erro ao encerrar sessão no servidor:", err);
        } finally {
            setUser(null);
            // Opcional: recarregar a página para limpar caches residuais
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            refreshUser,
            isAuthenticated: !!user,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
