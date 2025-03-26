import jwt from 'jsonwebtoken';
import { AuthenticationService } from './authentication.service';
import { JWT_SECRET } from '../../shared/configs';
import { BadRequestError } from '../../shared/utils/custom_error';
import { JWT_Expiration } from './authentication.dto';

// Mock the JWT module
jest.mock('jsonwebtoken');

describe('AuthenticationService', () => {
  let authService: AuthenticationService;

  beforeEach(() => {
    authService = new AuthenticationService();
  });

  describe('createRefreshToken', () => {
    it('should create a refresh token', async () => {
      const payload = { userId: '123' };
      const refreshToken = 'mockRefreshToken';

      // Mock jwt.sign to return a fake token
      (jwt.sign as jest.Mock).mockReturnValue(refreshToken);

      const token = await authService.createRefreshToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, JWT_SECRET, {
        expiresIn: JWT_Expiration.createRefreshToken,
      });
      expect(token).toBe(refreshToken);
    });
  });

  describe('createAccessToken', () => {
    it('should create an access token', () => {
      const payload = { userId: '123' };
      const accessToken = 'mockAccessToken';

      // Mock jwt.sign to return a fake token
      (jwt.sign as jest.Mock).mockReturnValue(accessToken);

      const token = authService.createAccessToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, JWT_SECRET, {
        expiresIn: JWT_Expiration.accessToken,
      });
      expect(token).toBe(accessToken);
    });
  });

  describe('verifyJWT', () => {
    it('should verify a valid JWT token', async () => {
      const token = 'validToken';
      const decodedPayload = { userId: '123' };

      // Mock jwt.verify to return a decoded payload
      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

      const decoded = await AuthenticationService.verifyJWT(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, JWT_SECRET);
      expect(decoded).toBe(decodedPayload);
    });

    it('should throw BadRequestError when token is expired', async () => {
      const token = 'expiredToken';
      // Mock jwt.verify to throw a TokenExpiredError
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      });

      await expect(AuthenticationService.verifyJWT(token)).rejects.toThrow(BadRequestError);
      await expect(AuthenticationService.verifyJWT(token)).rejects.toThrow('Token expired');
    });

    it('should throw BadRequestError when token is invalid', async () => {
      const token = 'invalidToken';
      // Mock jwt.verify to throw a JsonWebTokenError
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('invalid token');
      });

      await expect(AuthenticationService.verifyJWT(token)).rejects.toThrow(BadRequestError);
      await expect(AuthenticationService.verifyJWT(token)).rejects.toThrow('Invalid token');
    });
  });
});
