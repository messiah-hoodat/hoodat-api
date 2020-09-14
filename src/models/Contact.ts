import mongoose from 'mongoose';

export interface ContactDocument extends mongoose.Document {
  owner?: string;
  name: string;
  fileType: string;
  data: string
}

export const ContactSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  data: {
    type: String,
    required: true
  }
});

export const Contact = mongoose.model<ContactDocument>('contacts', ContactSchema);
