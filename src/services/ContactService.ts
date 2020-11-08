import Boom from '@hapi/boom';

import { AddContactInput } from '../controllers/ListController';
import s3 from '../lib/s3';
import { Contact, ContactDocument } from '../models/Contact';

const { AWS_S3_BUCKET_NAME } = process.env;

class ContactService {
  public async createContact(
    input: AddContactInput,
    ownerId: string
  ): Promise<ContactDocument> {
    // Create contact
    const contact = new Contact({
      owner: ownerId,
      name: input.name,
    });

    // Upload image
    const fileExtension = input.image.name.split('.').pop();
    const contentTypeMap = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
    };
    const contentType = contentTypeMap[fileExtension];
    if (!contentType) {
      throw Boom.badRequest('Unsupported file type');
    }

    const params: AWS.S3.PutObjectRequest = {
      ACL: 'public-read',
      Body: Buffer.from(input.image.data, 'base64'),
      ContentEncoding: 'base64',
      ContentType: contentType,
      Bucket: AWS_S3_BUCKET_NAME,
      Key: `contact_images/${contact._id}.${fileExtension}`,
    };

    let data: AWS.S3.ManagedUpload.SendData;
    try {
      data = await s3.upload(params).promise();
    } catch (err) {
      console.log(err);
      throw Boom.internal('Error uploading file: ', err);
    }

    // Add URL to contact
    contact.image.url = data.Location;

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

    const key = new URL(contact.image.url).pathname.substring(1);
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: AWS_S3_BUCKET_NAME,
      Key: key,
    };

    try {
      await s3.deleteObject(params).promise();
    } catch (err) {
      console.log(err);
      throw Boom.internal('Error deleting file: ', err);
    }
  }
}

export default new ContactService();
