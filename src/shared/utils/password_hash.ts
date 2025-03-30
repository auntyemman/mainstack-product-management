import argon2 from 'argon2';
import { APIError } from './custom_error';

// Function to hash a password
export async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password);
  } catch (error) {
    throw new APIError('Error hashing password');
  }
}

// Function to compare a password with its hash
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await argon2.verify(hashedPassword, password);
}
