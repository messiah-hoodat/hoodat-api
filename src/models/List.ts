import mongoose from 'mongoose';

import { ContactDocument } from './Contact';
import { UserDocument } from './User';

export interface ListDocument extends mongoose.Document {
  name: string;
  owner: UserDocument['_id'];
  color?: number;
  contacts?: ContactDocument['_id'][];
}

export const ListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  color: {
    type: Number,
    required: false,
  },
  contacts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      required: false,
    },
  ],
});

export const List = mongoose.model<ListDocument>('List', ListSchema, 'lists');
