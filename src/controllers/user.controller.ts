import { Controller, Post, Get, Route, Tags, Query, Body, Path } from 'tsoa';

interface User {
  email: string,
  firstName: string,
  lastName: string
}

@Route('/users')
@Tags('Users')
export class UserController {

  @Post('{userId}')
  public async getUser(@Path() userId: string, @Query() token: string): Promise<User> {
    return {
      email: "johndoe@gmail.com",
      firstName: "John",
      lastName: "Doe"
    }
  }

}