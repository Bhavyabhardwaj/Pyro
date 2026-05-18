import { api } from "../lib/axios";
import type { ApiResponse, Message } from "../types/api";

export const messageService = {
    async getRoomMessages(roomId: string) {
        const response = await api.get<ApiResponse<Message[]>>(`/rooms/${roomId}/messages`);
        return response.data;
    },
    async sendMessage(roomId: string, content: string) {
        const response = await api.post<ApiResponse<Message>>(`/rooms/${roomId}/messages`, { content });
        return response.data;
    }
}
