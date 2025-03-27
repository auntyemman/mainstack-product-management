export enum JWT_Expiration {
  accessToken = '5m',
  refreshToken = '30d',
}

export type User = {
  userId: string;
  email: string;
};

export interface JWTPayload extends User {
  iat: number;
  exp: number;
}
