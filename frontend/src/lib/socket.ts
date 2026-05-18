import io from "socket.io-client";

export const createSocket = (token: string) => {
    const socket = io("http://localhost:5000", {
        auth: {
            token,
        },
    }); 
    return socket;
};