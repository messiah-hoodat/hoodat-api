import Boom from "@hapi/boom";
import mongoose from 'mongoose';

import { UserDocument, User } from "../models/User";

class UserService {
  public async getUser(userId: string): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw Boom.badRequest('Invalid user ID');
    }

    let user: UserDocument;
    try {
      user = await User.findById(userId);
    } catch (err) {
      throw Boom.internal('Unable to find user by ID', err);
    }
    if (!user) {
      throw Boom.notFound('User not found');
    }

    return user;
  }

  public async getUserByEmail(email: string): Promise<UserDocument> {
    let user: UserDocument;
    try {
      user = await User.findOne({ email });
    } catch (err) {
      throw Boom.internal('Unable to find user by email', err);
    }
    if (!user) {
      throw Boom.notFound('User not found');
    }

    return user;
  }
}

export default new UserService();
