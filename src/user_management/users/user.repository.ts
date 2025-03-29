import { inject, injectable } from 'inversify';
import { BaseRepository } from '../../shared/database/base.repository';
import { IUser, User } from './user.model';
import { USER_TYPES } from './di/user.types';

@injectable()
export class UserRepository extends BaseRepository<IUser> {
  private readonly userModel;
  constructor() {
    super(User);
    this.userModel = User;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const user = await this.userModel.findOne({ email });
    if (user) {
      return user;
    }
    return null;
  }
}
