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

import { List, ListDocument } from '../models/List';
import getDecodedToken from '../lib/getDecodedToken';

interface AddListInput {
  name: string;
}

@Route('/lists')
@Tags('Lists')
export class ListsController {
  /**
   * Creates a list that is owned by the user
   */
  @Post('')
  public async addList(
    @Header('Authorization') authHeader: string,
    @Body() input: AddListInput
  ): Promise<ListDocument> {
    const token = getDecodedToken(authHeader);

    const list = new List({
      name: input.name,
      owner: token.userId,
    });

    try {
      await list.save();
    } catch (err) {
      throw Boom.internal('Error saving list: ', err);
    }

    return list;
  }
}
