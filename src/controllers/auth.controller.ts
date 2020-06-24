import { Controller, Post, Get, Route, Tags, Query, Body, Path } from 'tsoa';

interface LoginInput {
  email: string,
  password: string
}

interface LoginOutput {
  authToken: string,
}

interface LogoutOutput {
  message: string
}

interface RegisterInput {
  email: string,
  password: string,
  firstName: string,
  lastName: string
}

@Route('/auth')
@Tags('Auth')
export class UserController extends Controller {

  @Post('/request-token')
  public async login(@Body() requestBody: LoginInput): Promise<LoginOutput> {
    return {
      authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    }
  }

  @Post('/register')
  public async register(@Body() requestBody: RegisterInput): Promise<LoginOutput> {
    return {
      authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    }
  }

}