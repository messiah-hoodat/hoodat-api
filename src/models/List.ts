import mongoose from 'mongoose';

export interface ListDocument extends mongoose.Document {
  name: string;
  owner: string;
  contacts: string[] | undefined;
}

export const ListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  contacts: {
    type: [String],
    required: false
  }
});

export const List = mongoose.model<ListDocument>('lists', ListSchema);
