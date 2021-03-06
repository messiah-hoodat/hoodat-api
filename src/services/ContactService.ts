import Boom from '@hapi/boom';
import mongoose from 'mongoose';

import { AddContactInput } from '../controllers/ListController';
import { Contact, ContactDocument } from '../models/Contact';
import StorageService from './StorageService';

class ContactService {
  public async createContact(
    input: AddContactInput,
    ownerId: string
  ): Promise<ContactDocument> {
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      throw Boom.badRequest('Invalid owner ID');
    }

    // Create contact
    const contact = new Contact({
      name: input.name,
      owner: mongoose.Types.ObjectId(ownerId),
    });

    // Upload image
    const url = await StorageService.uploadContactImage(
      input.image,
      contact.id
    );

    // Add URL to contact
    contact.image.url = url;

    // Save contact
    try {
      await contact.save();
    } catch (err) {
      throw Boom.internal('Error saving contact: ', err);
    }

    return contact;
  }

  public async deleteContact(contactId: string): Promise<void> {
    const contact = await Contact.findById(contactId);
    if (!contact) {
      throw Boom.notFound('Contact does not exist');
    }

    try {
      await contact.deleteOne();
    } catch (err) {
      throw Boom.internal('Error deleting contact: ', err);
    }

    await StorageService.deleteFile(contact.image.url);
  }
}

export default new ContactService();
