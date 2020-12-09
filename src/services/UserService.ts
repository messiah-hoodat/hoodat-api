import Boom from "@hapi/boom";

import { UserDocument, User } from "models/User";

class UserService {
  public async getUser(userId: string) {
    let user: UserDocument;
    try {
      user = await User.findById(userId);
    } catch (err) {
      console.error(err);
      throw Boom.internal('Unable to find user by ID');
    }

    return user;
  }
}

export default new UserService();
