import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const PORT = process.env.PORT || 5000;

