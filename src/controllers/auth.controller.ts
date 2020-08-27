import { Controller, Post, Get, Route, Tags, Query, Body, Path } from 'tsoa';
import * as jwt from "jsonwebtoken";

import User from '../models/User';

interface LoginInput {
  email: string,
  password: string
}

interface LoginOutput {
  authToken: string,
}

interface SignUpInput {
  name: string,
  email: string,
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
  public async signUp(@Body() requestBody: SignUpInput): Promise<any> {
    const userId = '123';

    const user = new User({ userId, ...requestBody });

    try {
      await user.save();
    } catch (err) {
      console.log(err);
      return err;
    }

    return { code: 200, message: 'Successfully signed up user', userId };
  }

}