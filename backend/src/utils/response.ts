import { Response } from "express";
import { ApiResponse } from "../types/api.types";

export const responseUtils = {
    success<T>(
        res: Response,
        data: T,
        message?: string,
        statusCode: number = 200
    ): Response<ApiResponse<T>> {
        const response: ApiResponse<T> = {
            success: true,
            data,
            timestamp: new Date().toISOString(),
            ...(message && { message }),
        };
        return res.status(statusCode).json(response);
    },

    error(
        res: Response,
        error: string,
        statusCode: number = 500
    ): Response<ApiResponse<null>> {
        const response: ApiResponse<null> = {
            success: false,
            data: null,
            timestamp: new Date().toISOString(),
            ...(error && { message: error }),
        };
        return res.status(statusCode).json(response);
    }
}