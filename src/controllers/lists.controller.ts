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
import addListInputSchema from '../schemas/addListInputSchema';
import getDecodedToken from '../lib/getDecodedToken';

interface AddListInput {
  name: string;
  color?: string;
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
  ): Promise<any> {
    const token = getDecodedToken(authHeader);

    // Validate input
    try {
      await addListInputSchema.validateAsync(input);
    } catch (err) {
      throw Boom.badRequest('Validation failed', err);
    }

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

    return list;
  }
}
