export abstract class CustomError extends Error {
    abstract statusCode: number;
    abstract isOperational: boolean;

    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
    abstract serializeErrors(): { message: string; field?: string }[];
} 