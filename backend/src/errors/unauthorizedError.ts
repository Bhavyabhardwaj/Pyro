import { CustomError } from "./customError";

export class UnauthorizedError extends CustomError {
    statusCode = 401;
    isOperational = true;

    constructor(message: string = "Unauthorized") {
        super(message);
    }

    serializeErrors() {
        return [{ message: this.message }];
    }
}