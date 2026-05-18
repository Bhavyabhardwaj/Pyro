import React, { createContext, useState } from "react";

interface User {
    username: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const getInitialToken = () => localStorage.getItem("token");

const getInitialUser = () => {
    try {
        const storedUser =
            localStorage.getItem("user");

        return storedUser
            ? JSON.parse(storedUser)
            : null;

    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] =
        useState<string | null>(
            getInitialToken()
        );

    const [user, setUser] =
        useState<User | null>(
            getInitialUser()
        );

    const login = (user: User, token: string) => {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        setUser(user);
        setToken(token);
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
