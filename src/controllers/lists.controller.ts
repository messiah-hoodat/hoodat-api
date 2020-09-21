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
import { Contact, ContactDocument } from '../models/Contact';
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

    // Remove duplicate contacts
    const contacts = uniq(input.contacts);

    // Check if contact ids exist
    for (let i = 0; i < contacts.length; i++) {
      if (!mongoose.Types.ObjectId.isValid(contacts[i])) {
        throw Boom.notFound(`Invalid Contact ID: ${contacts[i]}`);
      }
      const contact = await Contact.findById(contacts[i]);
      if (!contact) {
        throw Boom.notFound(`Contact not found: ${contacts[i]}`);
      }
      if (contact.owner !== token.userId) {
        throw Boom.forbidden(
          `You do not have permission to add this contact: ${contacts[i]}`
        );
      }
    }

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
