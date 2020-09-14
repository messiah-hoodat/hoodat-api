import jwt from 'jsonwebtoken';
import Boom from '@hapi/boom';
import { Post, Get, Route, Tags, Path, Security, Header, Response, Request, Body } from 'tsoa';

import { User, UserDocument } from '../models/User';
import { Contact, ContactDocument } from '../models/Contact';

interface UserOutput {
  userId: string,
  name: string,
  email: string,
}

interface AddContactInput {
  name: string,
  fileType: string,
  data: string
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
  public async getUser(
    @Path() userId: string,
    @Header('Authorization') authHeader: string
  ): Promise<UserOutput> {
    const token = authHeader.split('Bearer ')[1];
    const decoded = jwt.decode(token, { json: true });

    const tokenId = decoded.userId;
    if (tokenId !== userId) {
      throw Boom.forbidden('User ID in path does not match user ID in token');
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

  /**
   * Creates a contact that is owned by the user
   */
  @Post('{userId}/contacts')
  public async addContact(
    @Path() userId: string,
    @Header('Authorization') authHeader: string,
    @Body() input: AddContactInput
  ): Promise<any> {
    const token = authHeader.split('Bearer ')[1];
    const decoded = jwt.decode(token, { json: true });

    const tokenId = decoded.userId;
    if (tokenId !== userId) {
      throw Boom.forbidden('User ID in path does not match user ID in token');
    }

    const contact = new Contact({
      owner: userId,
      name: input.name,
      fileType: input.fileType,
      data: input.data,
    });

    try {
      await contact.save();
    } catch (err) {
      throw Boom.internal('Error saving contact: ', err);
    }

    return contact;
  }
}