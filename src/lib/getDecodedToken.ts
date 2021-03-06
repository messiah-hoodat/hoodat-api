import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
}

export function getToken(authHeader: string): string {
  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    throw new Error('Auth header does not contain a bearer token');
  }

  return token;
}

export default function getDecodedToken(authHeader: string): TokenPayload {
  const token = getToken(authHeader);

  const payload = jwt.decode(token, { json: true });
  if (!payload) {
    throw new Error('Unable to decode token');
  }

  return payload as TokenPayload;
}
