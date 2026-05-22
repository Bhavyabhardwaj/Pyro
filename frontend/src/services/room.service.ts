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
    }
}
