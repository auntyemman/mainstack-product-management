export type User = {
  userId: string;
  email: string;
};

export interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
}
