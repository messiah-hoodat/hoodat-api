import { ContactOutput, ContactTransformer } from './ContactTransformer';
import { UserOutput, UserTransformer } from './UserTransformer';
import { ListDocument } from '../models/List';
import { ContactDocument } from '../models/Contact';

export interface ListOutput {
  id: string;
  name: string;
  owner: UserOutput;
  color: number;
  contacts: ContactOutput[];
  viewers: UserOutput[];
}

export interface PopulatedListDocument extends ListDocument {
  contacts?: ContactDocument[];
}

export class ListTransformer {
  static outgoing(list: PopulatedListDocument): ListOutput {
    return {
      id: list._id,
      name: list.name,
      owner: UserTransformer.outgoing(list.owner),
      color: list.color,
      contacts: list.contacts.map(ContactTransformer.outgoing),
      viewers: list.viewers.map(UserTransformer.outgoing),
    };
  }
}
