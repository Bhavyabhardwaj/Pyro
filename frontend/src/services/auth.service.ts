import { api } from "../lib/axios";
import type { ApiResponse, AuthPayload } from "../types/api";

export const authService = {
    async register(data: {username: string, password: string, email: string}) {
        const response = await api.post<ApiResponse<AuthPayload>>('/auth/register', data);
        return response.data;
    },
    async login(data: {email: string, password: string}) {
        const response = await api.post<ApiResponse<AuthPayload>>('/auth/login', data);
        return response.data;
    }
}
