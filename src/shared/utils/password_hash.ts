import argon2 from 'argon2';

// Function to hash a password
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

// Function to compare a password with its hash
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return argon2.verify(hashedPassword, password);
}
