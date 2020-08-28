import * as mongoose from 'mongoose';

export interface UserDocument extends mongoose.Document {
  name: string;
  username: string;
  password: string;
}

export const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

export const User = mongoose.model<UserDocument>('users', UserSchema);