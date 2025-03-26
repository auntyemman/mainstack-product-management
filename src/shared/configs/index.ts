import { config } from 'dotenv';
config();

export const NODE_ENV = process.env.NODE_ENV as string;
export const PORT = process.env.PORT || 3000;
export const DATABASE_URI = process.env.DATABASE_URI as string;
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const EMAIL_USER = process.env.EMAIL_USER as string;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD as string;
