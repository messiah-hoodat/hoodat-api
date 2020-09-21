import Boom from '@hapi/boom';
import { uniq } from 'lodash';
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
import { Contact } from '../models/Contact';
import addListInputSchema from '../schemas/addListInputSchema';
import getDecodedToken from '../lib/getDecodedToken';

interface AddListInput {
  name: string;
  color?: string;
  contacts?: string[];
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
  ): Promise<any> {
    // Validate input
    try {
      await addListInputSchema.validateAsync(input);
    } catch (err) {
      throw Boom.badRequest('Validation failed', err);
    }

    // Remove duplicate contacts
    const contacts = uniq(input.contacts);

    // Check if contact ids exist
    for (let i = 0; i < contacts.length; i++) {
      if (
        !mongoose.Types.ObjectId.isValid(contacts[i]) ||
        !(await Contact.exists({ _id: contacts[i] }))
      ) {
        throw Boom.notFound(`Contact not found: ${contacts[i]}`);
      }
    }

    const token = getDecodedToken(authHeader);

    const list = new List({
      name: input.name,
      owner: token.userId,
      color: input.color,
      contacts: contacts,
    });

    try {
      await list.save();
    } catch (err) {
      throw Boom.internal('Error saving list: ', err);
    }

    return list;
  }
}
