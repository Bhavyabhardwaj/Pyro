import { api } from "../lib/axios";
import type { ApiResponse, AuthPayload, User } from "../types/api";

export const authService = {
    async register(data: {username: string, password: string, email: string}) {
        const response = await api.post<ApiResponse<AuthPayload>>('/auth/register', data);
        return response.data;
    },
    async login(data: {email: string, password: string}) {
        const response = await api.post<ApiResponse<AuthPayload>>('/auth/login', data);
        return response.data;
    },
    async getMe() {
        const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
        return response.data;
    },
    async updateAvatar(data: { avatar: string | null }) {
        const response = await api.patch<ApiResponse<{ user: User }>>('/auth/avatar', data);
        return response.data;
    },
}
