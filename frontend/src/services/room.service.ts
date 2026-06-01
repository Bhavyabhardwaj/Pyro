import { api } from "../lib/axios";
import type { ApiResponse, Room, RoomMember } from "../types/api";

const pending: Map<string, Promise<any>> = new Map();

export const roomService = {
    async getRooms() {
        const key = "/rooms";
        if (pending.has(key)) return pending.get(key);
        const p = api.get<ApiResponse<RoomMember[]>>(key).then((res) => res.data).finally(() => pending.delete(key));
        pending.set(key, p);
        return p;
    },
    async createRoom(name: string) {
        const response = await api.post<ApiResponse<Room>>("/rooms", { name });
        return response.data;
    },
    async createDM(targetUserId: string) {
        const response = await api.post<ApiResponse<Room>>("/rooms/dm", { targetUserId });
        return response.data;
    },
    async getDiscoverRooms() {
        const response = await api.get<ApiResponse<Room[]>>("/rooms/discover");
        return response.data;
    },
    async joinRoom(roomId: string) {
        const response = await api.post<ApiResponse<null>>(`/rooms/${roomId}/join`);
        return response.data;
    },
    async generateRoomSummary(roomId: string) {
        // Backend maps this to /api/ai/rooms/:roomId/summarize
        const response = await api.post<ApiResponse<{ summary: string }>>(`/ai/rooms/${roomId}/summarize`);
        return response.data;
    }
};
