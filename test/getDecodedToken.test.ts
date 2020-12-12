import jwt from 'jsonwebtoken';

import getDecodedToken from '../src/lib/getDecodedToken';

beforeEach(() => {
  jest.clearAllMocks();
})

describe('getDecodedToken', () => {
  test('should return token payload', () => {
    const authHeader = 'Bearer 123';
    const decodeSpy = jest.spyOn(jwt, 'decode').mockReturnValueOnce({ userId: '123' });

    const token = getDecodedToken(authHeader);

    expect(token).toEqual({ userId: '123' });
    expect(decodeSpy).toHaveBeenCalledTimes(1);
  });

  test('should throw if auth header does not contain bearer token', () => {
    const authHeader = 'Bearer';
    const decodeSpy = jest.spyOn(jwt, 'decode')

    expect(() => getDecodedToken(authHeader)).toThrow();
    expect(decodeSpy).toHaveBeenCalledTimes(0);
  });

  test('should throw if unable to decode token', () => {
    const authHeader = 'Bearer 123';
    const decodeSpy = jest.spyOn(jwt, 'decode').mockReturnValueOnce(null);

    expect(() => getDecodedToken(authHeader)).toThrow();
    expect(decodeSpy).toHaveBeenCalledTimes(1);
  });
});