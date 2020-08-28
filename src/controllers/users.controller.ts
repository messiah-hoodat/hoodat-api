import * as jwt from 'jsonwebtoken';
import * as Boom from '@hapi/boom';
import { Controller, Post, Get, Route, Tags, Query, Body, Path, Security, Header } from 'tsoa';

import { User } from '../models/User';

interface UserOutput {
  username: string,
  name: string,
}

@Route('/users')
@Tags('Users')
export class UserController {

  /**
   * Gets all users
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
   * Gets a specific user by user ID
   */
  @Security('jwt')
  @Get('{userId}')
  public async getUser(@Path() userId: string, @Header('x-access-token') token: string): Promise<any> {
    const decoded = jwt.decode(token, { json: true });
    const tokenId = decoded.userId;
    if (tokenId !== userId) {
      throw Boom.badRequest('User ID in path does not match user ID in token')
    }
    return decoded;
  }
}