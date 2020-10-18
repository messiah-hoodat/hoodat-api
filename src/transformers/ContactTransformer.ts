import { ContactDocument } from 'models/Contact';

export interface ContactOutput {
  id: string;
  name: string;
  owner: string;
  fileType: string;
  data: string;
}

export class ContactTransformer {
  static outgoing(contact: ContactDocument): ContactOutput {
    return {
      id: contact._id,
      name: contact.name,
      owner: contact.owner,
      fileType: contact.fileType,
      data: contact.data,
    };
  }
}
