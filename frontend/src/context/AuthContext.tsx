import React, { useCallback, useEffect, useMemo, useState } from "react";
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

    useEffect(() => {
        console.log("AuthProvider initialized. token present:", Boolean(token));
    }, []);

    useEffect(() => {
        console.log("Auth token changed. present:", Boolean(token));
    }, [token]);

    const login = useCallback((user: User, token: string) => {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        setUser(user);
        setToken(token);
    }, []);

    const updateUser = useCallback((updates: Partial<User>) => {
        setUser((prev) => {
            const next = { ...(prev ?? {}), ...updates } as User;
            const stored = sanitizeStoredUser(next);
            localStorage.setItem("user", JSON.stringify(stored));
            return next;
        });
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
    }, []);

    const value = useMemo(
        () => ({ user, token, login, logout, updateUser }),
        [user, token, login, logout, updateUser],
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
