import { Controller, Post, Route, Tags, Body, Response } from 'tsoa';

import AuthService from 'services/AuthService';

interface TokenInput {
  email: string;
  password: string;
}

export interface TokenOutput {
  userId: string;
  token: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

@Route('/auth')
@Tags('Auth')
export class AuthController extends Controller {
  /**
   * Creates and returns an auth token by email and password
   */
  @Response(401, 'Incorrect password')
  @Response(404, 'Email not found')
  @Post('/token')
  public async token(@Body() input: TokenInput): Promise<TokenOutput> {
    return await AuthService.signIn(input.email, input.password);
  }

  /**
   * Signs up a new user and returns an auth token
   */
  @Response(400, 'Validation failed')
  @Response(409, 'Email already registered')
  @Post('/sign-up')
  public async signUp(@Body() input: SignUpInput): Promise<TokenOutput> {
    return await AuthService.signUp(input);
  }
}
