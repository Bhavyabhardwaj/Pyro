import express from "express";
import cors from "cors";
import { authRouter } from "./routes";
import { errorMiddleware } from "./middlewares";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to the Pyro API!");
})

app.use("/api/auth", authRouter);

app.use(errorMiddleware);
export default app;