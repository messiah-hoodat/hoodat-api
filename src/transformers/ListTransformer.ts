import { ContactOutput, ContactTransformer } from './ContactTransformer';
import { ListDocument } from 'models/List';
import { ContactDocument } from 'models/Contact';

export interface ListOutput {
  id: string;
  name: string;
  owner: string;
  color: number;
  contacts: ContactOutput[];
}

export interface PopulatedListDocument extends ListDocument {
  contacts?: ContactDocument[];
}

export class ListTransformer {
  static outgoing(list: PopulatedListDocument): ListOutput {
    return {
      id: list._id,
      name: list.name,
      owner: list.owner,
      color: list.color,
      contacts: list.contacts.map(ContactTransformer.outgoing),
    };
  }
}
