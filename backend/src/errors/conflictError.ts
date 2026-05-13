import { CustomError } from "./customError";

export class ConflictError extends CustomError {
    statusCode = 409;
    isOperational = true;

    constructor(message: string = "Conflict occurred") {
        super(message);
    }

    serializeErrors() {
        return [{ message: this.message }];
    }
}