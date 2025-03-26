import argon2 from 'argon2';
import { hashPassword, comparePasswords } from './password_hash';

describe('Password Utilities', () => {
  it('should hash a password', async () => {
    // Arrange
    const plainPassword = 'mySecretPassword123';

    // Act
    const hashedPassword = await hashPassword(plainPassword);

    // Assert
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(plainPassword); // Ensure the hash is different from the plain password
    expect(hashedPassword).toContain('$argon2'); // Basic check for argon2 hash format
  });

  it('should return true for correct password comparison', async () => {
    // Arrange
    const plainPassword = 'mySecretPassword123';
    const hashedPassword = await hashPassword(plainPassword);

    // Act
    const isMatch = await comparePasswords(plainPassword, hashedPassword);

    // Assert
    expect(isMatch).toBe(true);
  });

  it('should return false for incorrect password comparison', async () => {
    // Arrange
    const plainPassword = 'mySecretPassword123';
    const wrongPassword = 'wrongPassword123';
    const hashedPassword = await hashPassword(plainPassword);

    // Act
    const isMatch = await comparePasswords(wrongPassword, hashedPassword);

    // Assert
    expect(isMatch).toBe(false);
  });
});
