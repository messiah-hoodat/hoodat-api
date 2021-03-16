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

export interface ShareeOutput extends UserOutput {
  role: Role;
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
      editors: list.editors.map(UserTransformer.outgoing),
    };
  }

  static outgoingSharees(list: PopulatedListDocument): ShareeOutput[] {
    const owner: ShareeOutput = {
      id: list.owner.id,
      name: list.owner.name,
      email: list.owner.email,
      role: 'owner',
    };

    const editors: ShareeOutput[] = list.editors.map((user: UserDocument) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: 'editor',
    }));

    const viewers: ShareeOutput[] = list.editors.map((user: UserDocument) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: 'viewer',
    }));

    return [owner, ...editors, ...viewers];
  }
}
