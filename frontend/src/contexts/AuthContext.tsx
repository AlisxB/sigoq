import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
    user: User | null;
    login: (role: Role) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for testing
const mockUsers: Record<Role, User> = {
    ADMIN: {
        id: 1,
        username: 'admin',
        first_name: 'Alison',
        last_name: 'Admin',
        role: 'ADMIN'
    },
    COMERCIAL: {
        id: 2,
        username: 'vendedor1',
        first_name: 'João',
        last_name: 'Vendedor',
        role: 'COMERCIAL'
    },
    ORCAMENTISTA: {
        id: 3,
        username: 'tecnico1',
        first_name: 'Marcos',
        last_name: 'Técnico',
        role: 'ORCAMENTISTA'
    }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(mockUsers.ADMIN); // Default to ADMIN for development

    const login = (role: Role) => {
        setUser(mockUsers[role]);
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
