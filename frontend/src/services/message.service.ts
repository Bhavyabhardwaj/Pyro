import { api } from "../lib/axios";

export const messageService = {
    async getRoomMessages(roomId: string) {
        const response = await api.get(`/rooms/${roomId}/messages`);
        return response.data;
    },
    async sendMessage(roomId: string, content: string) {
        const response = await api.post(`/rooms/${roomId}/messages`, { content });
        return response.data;
    }
}