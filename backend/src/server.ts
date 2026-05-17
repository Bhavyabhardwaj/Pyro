import app from "./app";
import { PORT } from "./config";
import http from "http";
import { initializeSocket } from "./socket";

const server = http.createServer(app);

initializeSocket(server);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default server;
