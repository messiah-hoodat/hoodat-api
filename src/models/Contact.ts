import mongoose from 'mongoose';

import { UserDocument } from './User';

export interface ContactDocument extends mongoose.Document {
  name: string;
  owner: UserDocument['_id'];
  image: {
    url: string;
  };
}

export const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  image: {
    url: {
      type: String,
      required: true,
    },
  },
});

export const Contact = mongoose.model<ContactDocument>(
  'Contact',
  ContactSchema,
  'contacts'
);
