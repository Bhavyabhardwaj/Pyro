import express from "express";
import cors from "cors";
import { authRouter, roomRouter } from "./routes";
import { errorMiddleware } from "./middlewares";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to the Pyro API!");
})

app.use("/api/auth", authRouter);
app.use("/api/rooms", roomRouter);

app.use(errorMiddleware);
export default app;
