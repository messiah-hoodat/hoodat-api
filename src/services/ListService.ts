import Boom from '@hapi/boom';
import mongoose from 'mongoose';

import {
  AddContactInput,
  AddListInput,
  Role,
  ShareListInput,
  UpdateListInput,
} from '../controllers/ListController';
import { Contact } from '../models/Contact';
import { List } from '../models/List';
import { PopulatedListDocument } from '../transformers/ListTransformer';
import ContactService from './ContactService';
import UserService from './UserService';
import MailService from './MailService';
import { values } from 'lodash';

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

    return await list
      .populate('contacts')
      .populate('viewers')
      .populate('editors')
      .populate('owner')
      .execPopulate();
  }

  public async getList(
    listId: string,
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

    const isOwner = list.owner.toString() === userId;
    const isEditor = list.editors.includes(userId);
    const isViewer = list.viewers.includes(userId);
    if (!(isOwner || isEditor || isViewer)) {
      throw Boom.forbidden('You do not have permission to view this list');
    }

    return await list
      .populate('contacts')
      .populate('viewers')
      .populate('editors')
      .populate('owner')
      .execPopulate();
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

    return await list
      .populate('contacts')
      .populate('viewers')
      .populate('editors')
      .populate('owner')
      .execPopulate();
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

    const isOwner = list.owner.toString() === userId;
    const isEditor = list.editors.includes(userId);
    if (!(isOwner || isEditor)) {
      throw Boom.forbidden('You do not have permission to update this list');
    }

    const contact = await ContactService.createContact(input, userId);

    list.contacts.push(contact._id);

    try {
      await list.save();
    } catch (err) {
      throw Boom.internal('Error saving list: ', err);
    }

    return await list
      .populate('contacts')
      .populate('viewers')
      .populate('editors')
      .populate('owner')
      .execPopulate();
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

    const isOwner = list.owner.toString() === userId;
    const isEditor = list.editors.includes(userId);
    if (!(isOwner || isEditor)) {
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

    return await list
      .populate('contacts')
      .populate('viewers')
      .populate('editors')
      .populate('owner')
      .execPopulate();
  }

  public async getLists(userId: string): Promise<PopulatedListDocument[]> {
    return await List.find({
      owner: userId,
    })
      .populate('contacts')
      .populate('viewers')
      .populate('editors')
      .populate('owner');
  }

  public async getSharedLists(
    userId: string
  ): Promise<PopulatedListDocument[]> {
    return await List.find({
      $or: [
        {
          viewers: userId,
        },
        {
          editors: userId,
        },
      ],
    })
      .populate('contacts')
      .populate('viewers')
      .populate('editors')
      .populate('owner');
  }

  public async shareList(
    input: ShareListInput,
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

    const isOwner = list.owner.toString() === userId;
    if (!isOwner) {
      throw Boom.forbidden('You do not have permission to share this list');
    }

    const sharee = await UserService.getUserByEmail(input.email);

    if (
      [
        list.owner.toString(),
        ...list.viewers.map((id) => id.toString()),
        ...list.editors.map((id) => id.toString()),
      ].includes(sharee.id)
    ) {
      throw Boom.conflict('The list is already shared with that user');
    }

    switch (input.role) {
      case 'viewer':
        list.viewers.push(sharee.id);
        break;
      case 'editor':
        list.editors.push(sharee.id);
        break;
    }

    try {
      await list.save();
    } catch (err) {
      throw Boom.internal('Error saving list: ', err);
    }

    MailService.sendListSharedEmail(input.email, user.name, list.name);

    return await list
      .populate('contacts')
      .populate('viewers')
      .populate('editors')
      .populate('owner')
      .execPopulate();
  }

  public async getListSharees(
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

    const isOwner = list.owner.toString() == user.id;
    const isViewer = list.viewers.includes(user.id);
    const isEditor = list.editors.includes(user.id);

    if (!(isOwner || isViewer || isEditor)) {
      throw Boom.forbidden('You do not have permission to access this list.');
    }

    return await list
      .populate('contacts')
      .populate('viewers')
      .populate('editors')
      .populate('owner')
      .execPopulate();
  }

  public async unshareList(
    shareeId: string,
    listId: string,
    requesterId: string
  ): Promise<PopulatedListDocument> {
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw Boom.badRequest('Invalid list ID');
    }
    if (!mongoose.Types.ObjectId.isValid(shareeId)) {
      throw Boom.badRequest('Invalid user ID');
    }

    const user = await UserService.getUser(requesterId);
    const list = await List.findById(listId);
    if (!list) {
      throw Boom.notFound('List does not exist');
    }
    if (list.owner.toString() !== user.id) {
      throw Boom.forbidden(
        'You must be the owner of the list to remove an editor.'
      );
    }

    list.editors = list.editors.filter((id) => id.toString() !== shareeId);
    list.viewers = list.viewers.filter((id) => id.toString() !== shareeId);

    try {
      await list.save();
    } catch (err) {
      throw Boom.internal('Error saving list: ', err);
    }

    return await list
      .populate('contacts')
      .populate('viewers')
      .populate('editors')
      .populate('owner')
      .execPopulate();
  }

  public async updateSharee(
    shareeId: string,
    listId: string,
    requesterId: string,
    role: Role
  ): Promise<PopulatedListDocument> {
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw Boom.badRequest('Invalid list ID');
    }
    if (!mongoose.Types.ObjectId.isValid(shareeId)) {
      throw Boom.badRequest('Invalid user ID');
    }

    const user = await UserService.getUser(requesterId);
    const list = await List.findById(listId);
    if (!list) {
      throw Boom.notFound('List does not exist');
    }
    if (list.owner.toString() !== user.id) {
      throw Boom.forbidden(
        'You must be the owner of the list to remove an editor.'
      );
    }

    const sharee = await UserService.getUser(shareeId);

    list.editors = list.editors.filter((id) => id.toString() !== shareeId);
    list.viewers = list.viewers.filter((id) => id.toString() !== shareeId);

    switch (role) {
      case 'viewer':
        list.viewers.push(sharee.id);
        break;
      case 'editor':
        list.editors.push(sharee.id);
        break;
    }

    try {
      await list.save();
    } catch (err) {
      throw Boom.internal('Error saving list: ', err);
    }

    return await list
      .populate('contacts')
      .populate('viewers')
      .populate('editors')
      .populate('owner')
      .execPopulate();
  }
}

export default new ListService();
