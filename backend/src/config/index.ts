import dotenv from 'dotenv';

dotenv.config();

// Validate and ensure all required env vars are present
const validateEnv = () => {
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
    const PORT = process.env.PORT || '5000';

    if (!JWT_SECRET || typeof JWT_SECRET !== 'string') {
        throw new Error('JWT_SECRET must be a valid string');
    }
    if (!JWT_EXPIRES_IN || typeof JWT_EXPIRES_IN !== 'string') {
        throw new Error('JWT_EXPIRES_IN must be a valid string');
    }

    return { JWT_SECRET, JWT_EXPIRES_IN, PORT: Number(PORT) };
};

const env = validateEnv();

export const JWT_SECRET: string = env.JWT_SECRET;
export const JWT_EXPIRES_IN: string = env.JWT_EXPIRES_IN;
export const PORT: number = env.PORT;

