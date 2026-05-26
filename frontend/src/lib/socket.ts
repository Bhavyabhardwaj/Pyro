import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;
let refCount = 0;
let disconnectTimer: ReturnType<typeof setTimeout> | null = null;

export function connectSocket(token: string): Socket {
    if (socket) {
        // cancel any pending disconnect scheduled by a recent release
        if (disconnectTimer) {
            clearTimeout(disconnectTimer);
            disconnectTimer = null;
        }
        refCount += 1;
        return socket;
    }
    const socketURL = import.meta.env.VITE_SOCKET_URL || 
        (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") : "http://localhost:5000");

    socket = io(socketURL, {
        auth: { token },
    });
    refCount = 1;

    // cleanup on page unload
    if (typeof window !== "undefined") {
        window.addEventListener("beforeunload", () => {
            socket?.disconnect();
        });
    }
    return socket;
}

export function releaseSocket(): void {
    refCount = Math.max(0, refCount - 1);
    if (refCount === 0 && socket) {
        // delay actual disconnect slightly to tolerate React StrictMode
        disconnectTimer = setTimeout(() => {
            socket?.disconnect();
            socket = null;
            disconnectTimer = null;
        }, 150);
    }
}

export function getSocket(): Socket | null {
    return socket;
}
