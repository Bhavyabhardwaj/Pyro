import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import prisma from "../lib/prisma";
import { BadRequestError } from "../errors";

dotenv.config();

let aiInstance: GoogleGenAI | null = null;

function getAiClient() {
    if (!aiInstance) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("[Gemini AI Service Error]: GEMINI_API_KEY is not defined in process.env!");
            throw new BadRequestError("Gemini API key is missing on the server.");
        }
        aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
}

export const aiService = {
    async generateResponse(prompt: string) {
        try {
            const ai = getAiClient();
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-lite",
                contents: prompt,
            });

            return response.text;
        } catch (error: any) {
            console.error("[Gemini AI Service Error]:", error);
            if (error.status === 503) {
                throw new BadRequestError(
                    "Gemini is busy right now. Please try again in a few seconds."
                );
            }

            throw new BadRequestError(
                `Failed to generate AI response: ${error.message || error}`
            );
        }
    },
    async summarizeRoom(roomId: string, userId: string) {
        const isMember = await prisma.roomMember.findUnique({
            where: {
                userId_roomId: {
                    roomId,
                    userId,
                },
            },
        });
        if (!isMember) {
            throw new BadRequestError("User is not a member of this room");
        }
        const messages = await prisma.message.findMany({
            where: {
                roomId,
                isDeleted: false,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 30,
            include: {
                author: {
                    select: {
                        username: true,
                    },
                },
            },
        });
        if (messages.length === 0) {
            throw new BadRequestError(
                "No messages found in this room"
            );
        }
        const context = messages
            .reverse()
            .map((message) => `${message.author.username}: ${message.content}`)
            .join("\n");

        const prompt = `
You are Pyro AI.

Analyze the conversation and provide:

1. Main discussion topics
2. Important decisions or conclusions
3. Action items (if any)

Return ONLY bullet points.

Conversation:

${context}
`;
        const response = await this.generateResponse(prompt);
        return response;
    },
};
