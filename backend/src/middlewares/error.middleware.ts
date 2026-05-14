import type{ Request, Response, NextFunction } from "express";

import { CustomError } from "../errors";

export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction): void => {
    if(error instanceof CustomError) {
        res.status(error.statusCode).json({
            success: false,
            errors: error.serializeErrors(),
            timestamp: new Date().toISOString(),
        });
        return;
    }
    console.error("Unexpected error:", error);
    res.status(500).json({
        success: false,

        errors: [{ message: "An unexpected error occurred" }],
        timestamp: new Date().toISOString(),
    });
}