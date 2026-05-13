import { Express } from "express";

export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user :{
        id: string;
        username: string;
        email: string;
        avatar?: string;
    };
}

export interface AuthenticatedRequest extends Express.Request {
    user?: {
        id: number;
        username: string;
        email: string;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    timestamp: string;
}