export type User = {
  userId: string;
  email: string;
};

export interface JWTPayload extends User {
  iat: number;
  exp: number;
}
