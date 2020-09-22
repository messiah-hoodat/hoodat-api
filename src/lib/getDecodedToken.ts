import jwt from 'jsonwebtoken';

interface Token {
  userId: string;
}

export default function getDecodedToken(authHeader: string): Token {
  const token = authHeader.split('Bearer ')[1];
  const decoded = jwt.decode(token, { json: true });
  return decoded as Token;
}
