import { api } from "../lib/axios";
import type { ApiResponse, Room, RoomMember } from "../types/api";

export const roomService = {
    async getRooms() {
        const response = await api.get<ApiResponse<RoomMember[]>>("/rooms");
        return response.data;
    },
    async createRoom(name: string) {
        const response = await api.post<ApiResponse<Room>>("/rooms", { name });
        return response.data;
    }
}
