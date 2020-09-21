import mongoose from 'mongoose';

export interface ListDocument extends mongoose.Document {
  name: string;
  owner: string;
  color?: string;
  contacts?: string[];
}

export const ListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: false,
  },
  contacts: {
    type: [String],
    required: false,
  },
});

export const List = mongoose.model<ListDocument>('lists', ListSchema);
