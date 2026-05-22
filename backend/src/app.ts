import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { authRouter, roomRouter } from "./routes";
import { errorMiddleware } from "./middlewares";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Setup uploads directory
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

app.get("/", (req, res) => {
    res.send("Welcome to the Pyro API!");
});

app.post("/api/upload", (req, res, next) => {
    try {
        const { name, mime, base64 } = req.body;
        if (!base64 || !name) {
            res.status(400).json({ success: false, message: "Missing file name or base64 data" });
            return;
        }

        const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let buffer: Buffer;
        if (matches && matches.length === 3) {
            buffer = Buffer.from(matches[2], "base64");
        } else {
            buffer = Buffer.from(base64, "base64");
        }

        const cleanName = name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${Date.now()}-${cleanName}`;
        const filePath = path.join(uploadsDir, filename);
        
        fs.writeFileSync(filePath, buffer);

        const fileUrl = `http://localhost:5000/uploads/${filename}`;
        res.json({
            success: true,
            data: {
                url: fileUrl,
                name,
                mime: mime || "application/octet-stream",
                size: buffer.length
            }
        });
    } catch (error) {
        next(error);
    }
});

app.use("/api/auth", authRouter);
app.use("/api/rooms", roomRouter);

app.use(errorMiddleware);
export default app;
