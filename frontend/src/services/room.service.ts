import { api } from "../lib/axios";

export const roomService = {
    async getRooms() {
        const response = await api.get("/rooms");
        return response.data;
    },
    async createRoom(name: string) {
        const response = await api.post("/rooms", { name });
        return response.data;
    }
}