import { Controller, Post, Get, Route, Tags, Query, Body, Path, Security } from 'tsoa';

import User from '../models/User';

interface UserOutput {
  email: string,
  firstName: string,
  lastName: string
}

@Route('/users')
@Tags('Users')
export class UserController {

  /**
   * Get all users
   */
  @Get('')
  public async getUsers(): Promise<Array<any>> {
    try {
      const users = await User.find();
      return users;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  /**
   * Get a specific user by user id
   */
  @Security('jwt')
  @Get('{userId}')
  public async getUser(@Path() userId: string): Promise<UserOutput> {
    return {
      email: 'johndoe@gmail.com',
      firstName: 'John',
      lastName: 'Doe',
    };
  }
}