import { Controller, Post, Get, Route, Tags, Query, Body, Path } from 'tsoa';
import * as jwt from "jsonwebtoken";

interface LoginInput {
  email: string,
  password: string
}

interface LoginOutput {
  authToken: string,
}

interface RegisterInput {
  email: string,
  password: string,
  firstName: string,
  lastName: string
}

@Route('/auth')
@Tags('Auth')
export class AuthController extends Controller {

  @Post('/request-token')
  public async login(@Body() requestBody: LoginInput): Promise<any> {
    var token = jwt.sign({ userId: '5843543' }, process.env.TOKEN_SECRET);
    return token;
  }

  @Post('/register')
  public async register(@Body() requestBody: RegisterInput): Promise<LoginOutput> {
    return {
      authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    }
  }

}