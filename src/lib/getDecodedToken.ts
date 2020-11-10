import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
}

export default function getDecodedToken(authHeader: string): TokenPayload {
  const token = authHeader.split('Bearer ')[1];
  const decoded = jwt.decode(token, { json: true });
  return decoded as TokenPayload;
}
