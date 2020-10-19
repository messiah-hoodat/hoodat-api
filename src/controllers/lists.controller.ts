import Boom from '@hapi/boom';
import mongoose from 'mongoose';
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
import { ListOutput, ListTransformer } from '../transformers/ListTransformer';

interface AddListInput {
  name: string;
  color?: number;
}

@Route('/lists')
@Tags('Lists')
export class ListsController {
  /**
   * Creates a list that is owned by the user
   */
  @Security('jwt')
  @Response(403)
  @Post('')
  public async addList(
    @Header('Authorization') authHeader: string,
    @Body() input: AddListInput
  ): Promise<ListOutput> {
    const token = getDecodedToken(authHeader);

    const list = new List({
      name: input.name,
      owner: mongoose.Types.ObjectId(token.userId),
      color: input.color,
    });

    try {
      await list.save();
    } catch (err) {
      throw Boom.internal('Error saving list: ', err);
    }

    return ListTransformer.outgoing(list);
  }
}
