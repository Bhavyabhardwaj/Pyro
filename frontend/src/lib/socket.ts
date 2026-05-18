import { io } from "socket.io-client";

export const createSocket = (token: string) => {
    return io("http://localhost:5000", {
        auth: {
            token,
        },
    });
};
