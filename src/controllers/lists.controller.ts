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
  Delete,
  Patch,
} from 'tsoa';

import { List, ListDocument } from '../models/List';
import getDecodedToken from '../lib/getDecodedToken';
import { ListOutput, ListTransformer } from '../transformers/ListTransformer';
import { AddContactInput, ALLOWED_MIMETYPES } from './users.controller';
import { Contact } from '../models/Contact';

interface AddListInput {
  name: string;
  color?: number;
}

interface UpdateListInput {
  name?: string;
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

  /**
   * Updates a list
   */
  @Security('jwt')
  @Patch('{listId}')
  public async updateList(
    @Path() listId: string,
    @Header('Authorization') authHeader: string,
    @Body() input: UpdateListInput
  ): Promise<ListOutput> {
    const token = getDecodedToken(authHeader);

    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw Boom.badRequest('Invalid list ID');
    }
    const list = await List.findById(listId);
    if (!list) {
      throw Boom.notFound('List does not exist');
    }
    if (list.owner.toString() !== token.userId) {
      throw Boom.forbidden('You do not have permission to update this list');
    }

    if (input.color !== undefined) {
      list.color = input.color;
    }
    if (input.name) {
      list.name = input.name;
    }

    try {
      await list.save();
    } catch (err) {
      throw Boom.internal('Error updating list: ', err);
    }

    return ListTransformer.outgoing(list);
  }

  /**
   * Deletes a list and all contacts on the list
   */
  @Security('jwt')
  @Delete('{listId}')
  public async removeList(
    @Path() listId: string,
    @Header('Authorization') authHeader: string
  ): Promise<any> {
    const token = getDecodedToken(authHeader);

    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw Boom.badRequest('Invalid list ID');
    }
    const list = await List.findById(listId);
    if (!list) {
      throw Boom.notFound('List does not exist');
    }
    if (list.owner.toString() !== token.userId) {
      throw Boom.forbidden('You do not have permission to delete this list');
    }

    for (const contact of list.contacts) {
      try {
        await Contact.findByIdAndDelete(contact);
      } catch (err) {
        throw Boom.internal('Error deleting contact: ', err);
      }
    }

    try {
      await list.deleteOne();
    } catch (err) {
      throw Boom.internal('Error deleting list: ', err);
    }

    return {
      statusCode: 200,
      message: 'List successfully deleted',
      listId,
    };
  }

  /**
   * Creates a contact and adds it to a list
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

    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw Boom.badRequest('Invalid list ID');
    }
    const list = await List.findById(listId);
    if (!list) {
      throw Boom.notFound('List does not exist');
    }
    if (list.owner.toString() !== token.userId) {
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

    const populatedList = await list.populate('contacts').execPopulate();

    return ListTransformer.outgoing(populatedList);
  }

  /**
   * Removes a contact from a list and deletes the contact
   */
  @Security('jwt')
  @Response(403)
  @Response(400)
  @Delete('{listId}/contacts/{contactId}')
  public async removeContactFromList(
    @Path() listId: string,
    @Path() contactId: string,
    @Header('Authorization') authHeader: string
  ): Promise<ListOutput> {
    const token = getDecodedToken(authHeader);

    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw Boom.badRequest('Invalid list ID');
    }
    const list = await List.findById(listId);
    if (!list) {
      throw Boom.notFound('List does not exist');
    }
    if (list.owner.toString() !== token.userId) {
      throw Boom.forbidden('You do not have permission to update this list');
    }

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      throw Boom.badRequest('Invalid contact ID');
    }
    const contact = await Contact.findById(contactId);
    if (!contact) {
      throw Boom.notFound('Contact does not exist');
    }

    list.contacts = list.contacts.filter(
      (contactId) => contactId.toString() !== contact._id.toString()
    );

    try {
      await list.save();
    } catch (err) {
      throw Boom.internal('Error saving list: ', err);
    }

    try {
      await contact.deleteOne();
    } catch (err) {
      throw Boom.internal('Error deleting contact: ', err);
    }

    const populatedList = await list.populate('contacts').execPopulate();

    return ListTransformer.outgoing(populatedList);
  }
}
