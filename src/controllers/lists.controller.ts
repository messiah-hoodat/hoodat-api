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
import { ListOutput, ListTransformer } from '../transformers/ListTransformer';
import { AddContactInput, ALLOWED_MIMETYPES } from './users.controller';
import { Contact } from '../models/Contact';

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
  ): Promise<ListOutput> {
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

    return ListTransformer.outgoing(list);
  }

  /**
   * Adds a contact to a list
   */
  @Security('jwt')
  @Response(403)
  @Response(400)
  @Post('{listId}/contacts')
  public async addContactToList(
    @Path() listId: string,
    @Header('Authorization') authHeader: string,
    @Body() input: AddContactInput
  ): Promise<ListOutput> {
    const token = getDecodedToken(authHeader);

    const list = await List.findById(listId);

    if (list.owner !== token.userId) {
      throw Boom.forbidden('You do not have permission to update this list');
    }

    if (!ALLOWED_MIMETYPES.includes(input.fileType)) {
      throw Boom.badRequest(`File type ${input.fileType} is not allowed`);
    }

    // Create contact
    const contact = new Contact({
      owner: token.userId,
      name: input.name,
      fileType: input.fileType,
      data: input.data,
    });

    try {
      await contact.save();
    } catch (err) {
      throw Boom.internal('Error saving contact: ', err);
    }

    // Add contact to list
    const contactId = contact._id;
    list.contacts.push(contactId);

    try {
      await list.save();
    } catch (err) {
      throw Boom.internal('Error saving list: ', err);
    }

    return ListTransformer.outgoing(list);
  }
}
