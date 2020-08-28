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

interface RequestTokenInput {
  username: string,
  password: string
}

interface SignUpInput {
  name: string,
  username: string,
  password: string,
}

@Route('/auth')
@Tags('Auth')
export class AuthController extends Controller {

  /**
   * Creates and returns an auth token by username and password
   */
  @Post('/request-token')
  public async requestToken(@Body() requestBody: RequestTokenInput): Promise<any> {
    // Make sure username exists
    let user: UserDocument;
    try {
      user = await User.findOne({ username: requestBody.username });
    } catch (err) {
      console.error(err);
      return err;
    }
    if (!user) {
      throw Boom.notFound(`Username '${requestBody.username}' is not registered to any existing user`)
    }

    // Verify password
    const isCorrect = compareSync(requestBody.password, user.password);
    if (!isCorrect) {
      throw Boom.unauthorized(`Incorrect password for '${requestBody.username}'`)
    }

    // Create and return token
    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET);
    return { code: 200, message: 'Successfully logged in', token };
  }

  /**
   * Signs up a new user
   */
  @Post('/sign-up')
  public async signUp(
    @Body() requestBody: SignUpInput,
    @Request() req: express.Request
  ): Promise<any> {
    // Validate input
    try {
      await signUpInputSchema.validateAsync(requestBody);
    } catch (err) {
      throw Boom.badRequest('Validation failed', err)
    }

    // Check if username already exists
    let existingUser;
    try {
      existingUser = await User.findOne({ username: requestBody.username });
    } catch (err) {
      console.error(err);
      return err;
    }
    if (existingUser) {
      throw Boom.conflict(`Username '${requestBody.username}' already exists`);
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

    return { code: 200, message: 'Successfully signed up user', user };
  }

}