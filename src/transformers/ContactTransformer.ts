import { ContactDocument } from 'models/Contact';

export interface ContactOutput {
  id: string;
  name: string;
  owner: string;
  image: {
    url: string;
  };
}

export class ContactTransformer {
  static outgoing(contact: ContactDocument): ContactOutput {
    return {
      id: contact._id,
      name: contact.name,
      owner: contact.owner,
      image: {
        url: contact.image.url,
      },
    };
  }
}
