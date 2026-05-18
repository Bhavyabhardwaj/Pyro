import { api } from "../lib/axios";

export const authService = {
    async register(data: {username: string, password: string, email: string}) {
        const response = await api.post('/auth/register', data);
        return response.data;
    },
    async login(data: {email: string, password: string}) {
        const response = await api.post('/auth/login', data);
        return response.data;
    }
}