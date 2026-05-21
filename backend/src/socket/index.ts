import { Server } from "socket.io";
import { presenceService } from "./presence";
import { AuthenticatedSocket } from "./types";

import type { Server as HTTPServer } from "http";
import { tokenUtils } from "../utils";

let io: Server;

export const initializeSocket = (server: HTTPServer) => {
    io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.use((socket: AuthenticatedSocket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error("Unauthorized"));
            }
            const decoded = tokenUtils.verifyToken(token);
            if (!decoded || typeof decoded === "string") {
                return next(new Error("Unauthorized"));
            }
            socket.user = {
                userId: decoded.userId,
            }
            next();
        } catch (error) {
            next(new Error("Unauthorized"));
        }
    });
    io.on("connection", (socket: AuthenticatedSocket) => {
        console.log(`User connected: ${socket.id}`);

        const userId = socket.user?.userId;

        presenceService.addUser(userId!, socket.id);
        socket.emit("online users", presenceService.getOnlineUsers());
        io.emit("userOnline", userId);
        console.log(`User ${userId} is online`);

        socket.on("joinRoom", (roomId: string) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        });

        socket.on("leaveRoom", (roomId: string) => {
            socket.leave(roomId);
            console.log(`User ${socket.id} left room ${roomId}`);
        });

        socket.on("disconnect", () => {
            const disconnectedUserId = presenceService.removeUser(socket.id);
            if (disconnectedUserId) {
                io.emit("userOffline", disconnectedUserId);
                console.log(`User ${disconnectedUserId} is offline`);
            }
            console.log(`User disconnected: ${socket.id}`);
        });
    });
    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};
