import { CustomError } from "./customError";

export class notFoundError extends CustomError {
    statusCode = 404;
    isOperational = true;

    constructor(message: string = "Resource Not Found") {
        super(message);
    }
    serializeErrors() {
        return [{ message: this.message }];
    }
}