import { api } from "../lib/axios";
import type { ApiResponse, Message } from "../types/api";

const pending: Map<string, Promise<any>> = new Map();

export const messageService = {
    async getRoomMessages(roomId: string, cursor?: string) {
        const key = `/rooms/${roomId}/messages${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`;
        if (pending.has(key)) return pending.get(key);
        const p = api.get<ApiResponse<{
            messages: Message[];
            nextCursor: string | null;
            hasMore: boolean;
            readStates?: { userId: string; lastReadMessageId: string }[];
        }>>(key).then((res) => res.data).finally(() => pending.delete(key));
        pending.set(key, p);
        return p;
    },
    async sendMessage(roomId: string, content: string, attachments?: any[]) {
        const response = await api.post<ApiResponse<Message>>(`/rooms/${roomId}/messages`, { content, attachments });
        return response.data;
    },
    async editMessage(roomId: string, messageId: string, content: string) {
        const response = await api.patch<ApiResponse<Message>>(`/rooms/${roomId}/messages/${messageId}`, { content, roomId });
        return response.data;
    },
    async deleteMessage(roomId: string, messageId: string) {
        const response = await api.delete<ApiResponse<Message>>(`/rooms/${roomId}/messages/${messageId}`, {
            data: { roomId }
        });
        return response.data;
    },
    async markAsRead(roomId: string, messageId: string) {
        const response = await api.post<ApiResponse<{ success: boolean }>>(`/rooms/${roomId}/messages/read`, { messageId });
        return response.data;
    }
}
