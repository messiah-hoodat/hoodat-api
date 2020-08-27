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
import { hashSync } from 'bcrypt';

import User from '../models/User';
import { signUpInputSchema } from '../schemas/signUpInputSchema';

interface LoginInput {
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

  @Post('/request-token')
  public async login(@Body() requestBody: LoginInput): Promise<any> {
    var token = jwt.sign({ userId: '5843543' }, process.env.TOKEN_SECRET);
    return token;
  }

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
      console.log(err);
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