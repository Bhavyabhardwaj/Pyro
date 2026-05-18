import { createContext } from "react";
import type { User } from "../types/api";

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
