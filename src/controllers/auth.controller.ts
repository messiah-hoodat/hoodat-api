import * as Boom from '@hapi/boom';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import {
  Controller,
  Post,
  Route,
  Tags,
  Body,
  Request,
} from 'tsoa';
import { hashSync, compareSync } from 'bcrypt';

import { User, UserDocument } from '../models/User';
import { signUpInputSchema } from '../schemas/signUpInputSchema';

interface TokenInput {
  email: string,
  password: string
}

interface SignUpInput {
  name: string,
  email: string,
  password: string,
}

@Route('/auth')
@Tags('Auth')
export class AuthController extends Controller {

  /**
   * Creates and returns an auth token by email and password
   */
  @Post('/token')
  public async token(@Body() requestBody: TokenInput): Promise<any> {
    // Make sure email is registered
    let user: UserDocument;
    try {
      user = await User.findOne({ email: requestBody.email });
    } catch (err) {
      console.error(err);
      return err;
    }
    if (!user) {
      throw Boom.notFound(`Email '${requestBody.email}' is not registered to any existing user`)
    }

    // Verify password
    const isCorrect = compareSync(requestBody.password, user.password);
    if (!isCorrect) {
      throw Boom.unauthorized(`Incorrect password for '${requestBody.email}'`)
    }

    // Create and return token
    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET);
    return { code: 200, message: 'Successfully logged in', userId: user._id, token };
  }

  /**
   * Signs up a new user
   */
  @Post('/sign-up')
  public async signUp(
    @Body() requestBody: SignUpInput,
  ): Promise<any> {
    // Validate input
    try {
      await signUpInputSchema.validateAsync(requestBody);
    } catch (err) {
      throw Boom.badRequest('Validation failed', err)
    }

    // Check if email is already registered
    let existingUser;
    try {
      existingUser = await User.findOne({ email: requestBody.email });
    } catch (err) {
      console.error(err);
      return err;
    }
    if (existingUser) {
      throw Boom.conflict(`Email '${requestBody.email}' is already registered`);
    }

    // Hash the password
    requestBody.password = hashSync(requestBody.password, 10);

    // Create a new user
    const user = new User(requestBody);
    try {
      await user.save();
    } catch (err) {
      console.log(err);
      return err;
    }

    return { code: 200, message: 'Successfully signed up user', userId: user._id };
  }

}