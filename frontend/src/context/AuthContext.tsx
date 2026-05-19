import React, { useState } from "react";
import type { User } from "../types/api";
import { AuthContext } from "./auth-context";

const getInitialToken = () => localStorage.getItem("token");

const sanitizeStoredUser = (user: User | null) => {
    if (!user) return null;
    if (user.avatar?.startsWith("blob:")) {
        return { ...user, avatar: null };
    }
    return user;
};

const getInitialUser = () => {
    try {
        const storedUser =
            localStorage.getItem("user");

        return sanitizeStoredUser(
            storedUser
                ? JSON.parse(storedUser)
                : null,
        );

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

    const updateUser = (updates: Partial<User>) => {
        setUser((prev) => {
            const next = { ...(prev ?? {}), ...updates } as User;
            const stored = sanitizeStoredUser(next);
            localStorage.setItem("user", JSON.stringify(stored));
            return next;
        });
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
