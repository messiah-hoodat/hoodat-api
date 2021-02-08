import Boom from '@hapi/boom';
import mongoose from 'mongoose';

import {
  AddContactInput,
  AddListInput,
  UpdateListInput,
} from '../controllers/ListController';
import { Contact } from '../models/Contact';
import { List } from '../models/List';
import { PopulatedListDocument } from '../transformers/ListTransformer';
import ContactService from './ContactService';
import UserService from './UserService';

class ListService {
  public async createList(
    input: AddListInput,
    ownerId: string
  ): Promise<PopulatedListDocument> {
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      throw Boom.badRequest('Invalid owner ID');
    }

    const list = new List({
      name: input.name,
      owner: mongoose.Types.ObjectId(ownerId),
      color: input.color,
    });

    try {
      await list.save();
    } catch (err) {
      throw Boom.internal('Error saving list: ', err);
    }

    return await list.populate('contacts').execPopulate();
  }

  public async updateList(
    listId: string,
    input: UpdateListInput,
    userId: string
  ): Promise<PopulatedListDocument> {
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw Boom.badRequest('Invalid list ID');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw Boom.badRequest('Invalid user ID');
    }

    const list = await List.findById(listId);
    if (!list) {
      throw Boom.notFound('List does not exist');
    }
    if (list.owner.toString() !== userId) {
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

    return await list.populate('contacts').execPopulate();
  }

  public async deleteList(listId: string, userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw Boom.badRequest('Invalid list ID');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw Boom.badRequest('Invalid user ID');
    }

    const list = await List.findById(listId);
    if (!list) {
      throw Boom.notFound('List does not exist');
    }
    if (list.owner.toString() !== userId) {
      throw Boom.forbidden('You do not have permission to delete this list');
    }

    for (const contact of list.contacts) {
      await ContactService.deleteContact(contact._id);
    }

    try {
      await list.deleteOne();
    } catch (err) {
      throw Boom.internal('Error deleting list: ', err);
    }

    return;
  }

  public async addContactToList(
    listId: string,
    input: AddContactInput,
    userId: string
  ): Promise<PopulatedListDocument> {
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw Boom.badRequest('Invalid list ID');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw Boom.badRequest('Invalid user ID');
    }

    const list = await List.findById(listId);
    if (!list) {
      throw Boom.notFound('List does not exist');
    }
    if (list.owner.toString() !== userId) {
      throw Boom.forbidden('You do not have permission to update this list');
    }

    const contact = await ContactService.createContact(input, userId);

    list.contacts.push(contact._id);

    try {
      await list.save();
    } catch (err) {
      throw Boom.internal('Error saving list: ', err);
    }

    return await list.populate('contacts').execPopulate();
  }

  public async removeContactFromList(
    contactId: string,
    listId: string,
    userId: string
  ): Promise<PopulatedListDocument> {
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      throw Boom.badRequest('Invalid contact ID');
    }
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw Boom.badRequest('Invalid list ID');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw Boom.badRequest('Invalid user ID');
    }

    const list = await List.findById(listId);
    if (!list) {
      throw Boom.notFound('List does not exist');
    }
    if (list.owner.toString() !== userId) {
      throw Boom.forbidden('You do not have permission to update this list');
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

    await ContactService.deleteContact(contact._id);

    return await list.populate('contacts').execPopulate();
  }

  public async getLists(userId: string): Promise<PopulatedListDocument[]> {
    return await List.find({
      owner: userId,
    }).populate('contacts');
  }

  public async getSharedLists(
    userId: string
  ): Promise<PopulatedListDocument[]> {
    return await List.find({
      viewers: userId,
    }).populate('contacts');
  }

  public async addViewerToList(
    email: string,
    listId: string,
    userId: string
  ): Promise<PopulatedListDocument> {
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw Boom.badRequest('Invalid list ID');
    }

    const user = await UserService.getUser(userId);
    const list = await List.findById(listId);
    if (!list) {
      throw Boom.notFound('List does not exist');
    }
    if (list.owner.toString() !== user.id) {
      throw Boom.forbidden(
        'You must be the owner of the list to add a viewer.'
      );
    }

    const viewer = await UserService.getUserByEmail(email);
    list.viewers.push(viewer.id);

    try {
      await list.save();
    } catch (err) {
      throw Boom.internal('Error saving list: ', err);
    }

    return await list.populate('contacts').execPopulate();
  }

  public async removeViewerFromList(
    viewerId: string,
    listId: string,
    requesterId: string
  ): Promise<PopulatedListDocument> {
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw Boom.badRequest('Invalid list ID');
    }
    if (!mongoose.Types.ObjectId.isValid(viewerId)) {
      throw Boom.badRequest('Invalid user ID');
    }

    const user = await UserService.getUser(requesterId);
    const list = await List.findById(listId);
    if (!list) {
      throw Boom.notFound('List does not exist');
    }
    if (list.owner.toString() !== user.id) {
      throw Boom.forbidden(
        'You must be the owner of the list to remove a viewer.'
      );
    }

    list.viewers = list.viewers.filter((id) => id.toString() !== viewerId);

    try {
      await list.save();
    } catch (err) {
      throw Boom.internal('Error saving list: ', err);
    }

    return await list.populate('contacts').execPopulate();
  }
}

export default new ListService();
