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
} from 'tsoa';

import getDecodedToken from '../lib/getDecodedToken';
import {
  ListOutput,
  ListTransformer,
} from '../transformers/ListTransformer';
import ListService from 'services/ListService';
import { UserOutput, UserTransformer } from 'transformers/UserTransformer';
import UserService from 'services/UserService';

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

    return UserTransformer.outgoing(await UserService.getUser(token.userId));
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
  ): Promise<ListOutput[]> {
    const token = getDecodedToken(authHeader);

    if (token.userId !== userId) {
      throw Boom.forbidden('User ID in path does not match user ID in token');
    }

    const lists = await ListService.getLists(token.userId);

    return lists.map(ListTransformer.outgoing);
  }
}
