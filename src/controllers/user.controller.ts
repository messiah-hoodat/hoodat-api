import { Controller, Post, Get, Route, Tags, Query, Body, Path, Security } from 'tsoa';

interface User {
  email: string,
  firstName: string,
  lastName: string
}

@Route('/users')
@Tags('Users')
export class UserController {

  @Security('jwt')
  @Get('{userId}')
  public async getUser(@Path() userId: string): Promise<User> {
    return {
      email: "johndoe@gmail.com",
      firstName: "John",
      lastName: "Doe"
    }
  }

}