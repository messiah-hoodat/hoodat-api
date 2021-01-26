import {
  Controller,
  Post,
  Route,
  Tags,
  Body,
  Response,
  Security,
  Header,
} from 'tsoa';

import AuthService from '../services/AuthService';
import getDecodedToken from '../lib/getDecodedToken';

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

interface ResetPasswordInput {
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

  /**
   * Updates a user's password
   */
  @Security('jwt')
  @Post('/reset-password')
  public async resetPassword(
    @Header('Authorization') authHeader: string,
    @Body() input: ResetPasswordInput
  ): Promise<void> {
    const token = getDecodedToken(authHeader);

    await AuthService.resetPassword(token.userId, input.password);
  }
}
