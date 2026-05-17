import { Server } from "socket.io";
import { AuthenticatedSocket } from "./types";

import type { Server as HTTPServer } from "http";
import { tokenUtils } from "../utils";

export const initializeSocket = (server: HTTPServer) => {
    const io = new Server(server, {
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

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};
