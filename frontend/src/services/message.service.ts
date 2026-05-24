import { api } from "../lib/axios";
import type { ApiResponse, Message } from "../types/api";

const pending: Map<string, Promise<any>> = new Map();

export const messageService = {
    async getRoomMessages(roomId: string) {
        const key = `/rooms/${roomId}/messages`;
        if (pending.has(key)) return pending.get(key);
        const p = api.get<ApiResponse<{ messages: Message[]; nextCursor: string | null; hasMore: boolean }>>(key).then((res) => res.data).finally(() => pending.delete(key));
        pending.set(key, p);
        return p;
    },
    async sendMessage(roomId: string, content: string, attachments?: any[]) {
        const response = await api.post<ApiResponse<Message>>(`/rooms/${roomId}/messages`, { content, attachments });
        return response.data;
    }
}
