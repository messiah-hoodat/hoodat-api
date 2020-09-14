import jwt from 'jsonwebtoken';

export default function getDecodedToken(authHeader: string) {
  const token = authHeader.split('Bearer ')[1];
  const decoded = jwt.decode(token, { json: true });
  return decoded;
}