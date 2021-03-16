import { ContactOutput, ContactTransformer } from './ContactTransformer';
import { UserOutput, UserTransformer } from './UserTransformer';
import { ListDocument } from '../models/List';
import { ContactDocument } from '../models/Contact';
import { Role } from 'controllers/ListController';
import { UserDocument } from 'models/User';

export interface ListOutput {
  id: string;
  name: string;
  owner: UserOutput;
  color: number;
  contacts: ContactOutput[];
  viewers: UserOutput[];
  editors: UserOutput[];
}

export interface ListShareesOutput {
  id: string
  owner: UserOutput;
  viewers: UserOutput[];
  editors: UserOutput[];
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
      editors: list.editors.map(UserTransformer.outgoing)
    };
  }

  static outgoingSharees(list: PopulatedListDocument): ListShareesOutput {
    return {
      id: list.id,
      owner: UserTransformer.outgoing(list.owner),
      viewers: list.viewers.map(UserTransformer.outgoing),
      editors: list.editors.map(UserTransformer.outgoing)
    };
  }
}
