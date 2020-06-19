import { Controller, Post, Route, Tags, Query } from 'tsoa';

@Route('/user')
@Tags('User')
export class UserController extends Controller {
  @Post()
  public async create(@Query() email: string, @Query() password: string): Promise<any> {
    return {
      msg: "User created!",
      email: email,
      password: "********"
    };
  }
}