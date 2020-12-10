import { UserDocument } from '../models/User';

export interface UserOutput {
  id: string;
  name: string;
  email: string;
}

export class UserTransformer {
  static outgoing(user: UserDocument): UserOutput {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
    };
  }
}
