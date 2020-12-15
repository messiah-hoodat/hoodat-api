import { hashSync } from 'bcrypt';

import getDecodedToken from '../src/lib/getDecodedToken';
import { User } from '../src/models/User';
import AuthService from '../src/services/AuthService';
import UserService from '../src/services/UserService';

describe('AuthService', () => {
  describe('signIn', () => {
    const email = 'john.doe@gmail.com';
    const password = 'password';
    const hashedPassword = hashSync(password, 10);
    jest.spyOn(UserService, 'getUserByEmail').mockResolvedValue({
      _id: '1',
      email: 'john.doe@gmail.com',
      password: hashedPassword,
    } as never);

    test('should throw if password is incorrect', async () => {
      await expect(AuthService.signIn(email, 'wrong!')).rejects.toThrow();
    });

    test('should return token output', async () => {
      const token = await AuthService.signIn(email, password);

      expect(token).toHaveProperty('userId');
      expect(token).toHaveProperty('token');
    });
  });

  describe('signUp', () => {
    const input = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password',
    };

    test('should throw if input is invalid', async () => {
      const input = {
        name: 'John Doe',
        email: 'john.doe2gmail.com',
        password: 'password',
      };

      await expect(AuthService.signUp(input)).rejects.toThrow();
    });

    test('should throw if email already registered', async () => {
      jest
        .spyOn(User, 'findOne')
        .mockResolvedValueOnce({ email: 'john.doe@gmail.com' } as never);

      await expect(AuthService.signUp(input)).rejects.toThrow();
    });

    test('should throw if unable to find user', async () => {
      jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
        throw new Error();
      });

      await expect(AuthService.signUp(input)).rejects.toThrow();
    });

    test('should throw if user fails to save', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValueOnce(undefined);
      jest.spyOn(User.prototype, 'save').mockImplementationOnce(() => {
        throw new Error();
      });

      await expect(AuthService.signUp(input)).rejects.toThrow();
    });

    test('should sign up user and return token output', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValueOnce(undefined);
      jest.spyOn(User.prototype, 'save').mockImplementationOnce(() => {});

      const token = await AuthService.signUp(input);

      expect(token).toHaveProperty('userId');
      expect(token).toHaveProperty('token');
    });
  });

  describe('createToken', () => {
    test('should create and return token', () => {
      const userId = '123';

      const token = AuthService.createToken(userId);
      const payload = getDecodedToken(`Bearer ${token}`);

      expect(payload).toHaveProperty('userId', '123');
    });
  });
});
