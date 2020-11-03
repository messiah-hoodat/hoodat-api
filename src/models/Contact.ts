import mongoose from 'mongoose';

export interface ContactDocument extends mongoose.Document {
  owner: string;
  name: string;
  image: {
    url: string;
  };
}

export const ContactSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true,
  },
  name: {
    type: String,
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
