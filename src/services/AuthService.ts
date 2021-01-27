import Boom from '@hapi/boom';
import jwt from 'jsonwebtoken';
import { compareSync, hashSync } from 'bcrypt';

import UserService from './UserService';
import { TokenOutput, SignUpInput } from '../controllers/AuthController';
import {
  signUpInputSchema,
  passwordSchema,
} from '../schemas/signUpInputSchema';
import { User, UserDocument } from '../models/User';
import MailService from './MailService';

class AuthService {
  public async signIn(email: string, password: string): Promise<TokenOutput> {
    const user = await UserService.getUserByEmail(email);

    const isCorrect = compareSync(password, user.password);
    if (!isCorrect) {
      throw Boom.unauthorized('Incorrect password');
    }

    return { userId: user._id, token: await this.createToken(user._id) };
  }

  public async signUp(input: SignUpInput): Promise<TokenOutput> {
    // Validate input
    try {
      await signUpInputSchema.validateAsync(input);
    } catch (err) {
      throw Boom.badRequest('Validation failed', err);
    }

    // Check if email is already registered
    let existingUser: UserDocument;
    try {
      existingUser = await User.findOne({ email: input.email });
    } catch (err) {
      throw Boom.internal('Unable to find user by email', err);
    }
    if (existingUser) {
      throw Boom.conflict(`Email is already registered`);
    }

    // Hash the password
    const hashedPassword = hashSync(input.password, 10);

    // Create a new user
    const user = new User({
      name: input.name,
      email: input.email,
      password: hashedPassword,
    });
    try {
      await user.save();
    } catch (err) {
      throw Boom.internal('Error creating new user', err);
    }

    // Send welcome email
    MailService.sendWelcomeEmail(user.email);

    return { userId: user._id, token: await this.createToken(user._id) };
  }

  public createToken(userId: string): string {
    return jwt.sign({ userId }, process.env.TOKEN_SECRET);
  }

  public async resetPassword(userId: string, password: string): Promise<void> {
    // Validate input
    try {
      await passwordSchema.validateAsync(password);
    } catch (err) {
      throw Boom.badRequest('Validation failed', err);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw Boom.notFound('User not found');
    }

    const hashedPassword = hashSync(password, 10);

    user.password = hashedPassword;

    try {
      await user.save();
    } catch (err) {
      throw Boom.internal('Error saving user', err);
    }
  }
}

export default new AuthService();
