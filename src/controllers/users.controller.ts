import Boom from '@hapi/boom';
import {
  Post,
  Get,
  Route,
  Tags,
  Path,
  Security,
  Header,
  Response,
  Body,
} from 'tsoa';

import { User, UserDocument } from '../models/User';
import { Contact } from '../models/Contact';
import getDecodedToken from '../lib/getDecodedToken';
import { List } from '../models/List';

interface UserOutput {
  userId: string;
  name: string;
  email: string;
}

interface AddContactInput {
  name: string;
  fileType: string;
  data: string;
}

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png'];

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
    const token = getDecodedToken(authHeader);

    if (token.userId !== userId) {
      throw Boom.forbidden('User ID in path does not match user ID in token');
    }

    let user: UserDocument;
    try {
      user = await User.findById(userId);
    } catch (err) {
      console.error(err);
      return err;
    }
    return { userId: userId, name: user.name, email: user.email };
  }

  /**
   * Creates a contact that is owned by the user
   */
  @Security('jwt')
  @Response(403)
  @Post('{userId}/contacts')
  public async addContact(
    @Path() userId: string,
    @Header('Authorization') authHeader: string,
    @Body() input: AddContactInput
  ): Promise<any> {
    const token = getDecodedToken(authHeader);

    if (token.userId !== userId) {
      throw Boom.forbidden('User ID in path does not match user ID in token');
    }

    if (!ALLOWED_MIMETYPES.includes(input.fileType)) {
      throw Boom.badRequest(`File type ${input.fileType} is not allowed`);
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

  /**
   * Gets all contacts that are owned by the user
   */
  @Security('jwt')
  @Response(403)
  @Get('{userId}/contacts')
  public async getContacts(
    @Path() userId: string,
    @Header('Authorization') authHeader: string
  ): Promise<any> {
    const token = getDecodedToken(authHeader);

    if (token.userId !== userId) {
      throw Boom.forbidden('User ID in path does not match user ID in token');
    }

    const contacts = await Contact.find({ owner: userId });

    return contacts;
  }

  /**
   * Gets all lists that are owned by the user
   */
  @Security('jwt')
  @Response(403)
  @Get('{userId}/lists')
  public async getLists(
    @Path() userId: string,
    @Header('Authorization') authHeader: string
  ): Promise<any> {
    const token = getDecodedToken(authHeader);

    if (token.userId !== userId) {
      throw Boom.forbidden('User ID in path does not match user ID in token');
    }

    const lists = await List.find({ owner: userId });

    return lists;
  }
}
