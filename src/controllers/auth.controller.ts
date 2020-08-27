import { Controller, Post, Get, Route, Tags, Query, Response, Body, Path, Request } from 'tsoa';
import * as jwt from 'jsonwebtoken';
import * as Boom from '@hapi/boom';
import * as express from 'express';
import { hashSync } from 'bcrypt';

import User from '../models/User';

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
    const user = new User({...requestBody });
    try {
      await user.save();
    } catch (err) {
      console.log(err);
      return err;
    }

    return { code: 200, message: 'Successfully signed up user', user };
  }

}