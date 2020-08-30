import * as jwt from 'jsonwebtoken';
import * as Boom from '@hapi/boom';
import { Controller, Post, Get, Route, Tags, Query, Body, Path, Security, Header, Response } from 'tsoa';

import { User, UserDocument } from '../models/User';

interface UserOutput {
  userId: string,
  name: string,
  email: string,
}

@Route('/users')
@Tags('Users')
export class UserController {

  /**
   * Gets a specific user by user id
   */
  @Security('jwt')
  @Response(403)
  @Get('{userId}')
  public async getUser(@Path() userId: string, @Header('Authorization') authHeader: string): Promise<UserOutput> {
    const token = authHeader.split('Bearer ')[1];
    const decoded = jwt.decode(token, { json: true });

    const tokenId = decoded.userId;
    if (tokenId !== userId) {
      throw Boom.forbidden('User ID in path does not match user ID in token')
    }

    let user: UserDocument;
    try {
      user = await User.findById(tokenId);
    } catch (err) {
      console.error(err);
      return err;
    }
    return { userId: tokenId, name: user.name, email: user.email };
  }
}