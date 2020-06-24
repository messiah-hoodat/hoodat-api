import { Controller, Post, Get, Route, Tags, Query, Body, Path } from 'tsoa';

interface LoginInput {
  username: string,
  password: string
}

interface LoginOutput {
  authToken: string,
}

interface LogoutOutput {
  message: string
}

@Route('/auth')
@Tags('Auth')
export class UserController extends Controller {
  @Post('/login')
  public async login(@Body() requestBody: LoginInput): Promise<LoginOutput> {
    return {
      authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    }
  }

  @Post('/logout')
  public async logout(@Query() authToken: string): Promise<LogoutOutput> {
    return {
      message: "Successfully logged out."
    }
  }
}