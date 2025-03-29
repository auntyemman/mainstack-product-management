import { IUser } from './user.model';
import { hashPassword, comparePasswords } from '../../shared/utils/password_hash';
import { UserRepository } from './user.repository';
import { APIError, BadRequestError, NotFoundError } from '../../shared/utils/custom_error';
import crypto from 'crypto';
import { inject, injectable } from 'inversify';
import { USER_TYPES } from './di/user.types';
import { UserRole } from './user.dto';

@injectable()
export class UserService {
  // private readonly userRepo;
  constructor(@inject(USER_TYPES.UserRepository) private readonly userRepo: UserRepository) {
    this.userRepo = userRepo;
  }

  async makeAdmin(userId: string): Promise<IUser> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new NotFoundError('user not found');
    }
    const updatedUser = await this.updateUser(userId, { role: UserRole.admin });
    return updatedUser;
  }

  // async generateUserKeys(userId: string) {
  //   // Generate a new key pair
  //   const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  //     modulusLength: 2048,
  //     publicKeyEncoding: {
  //       type: 'spki',
  //       format: 'pem',
  //     },
  //     privateKeyEncoding: {
  //       type: 'pkcs8',
  //       format: 'pem',
  //     },
  //   });

  //   const hashedPrivateKey = await hashPassword(privateKey);

  //   // await this.updateUser(userId, { publicKey, hashedPrivateKey });
  //   return {
  //     publicKey,
  //     hashedPrivateKey,
  //   };
  // }

  // // get user public key
  // async getPulickey(userId: string) {
  //   const user = await this.getUser(userId);
  //   return user.publicKey;
  // }

  // // delete user public and private keys
  // async deleteKeys(userId: string) {
  //   const user = await this.updateUser(userId, { publicKey: null, privateKey: null });
  //   return user;
  // }

  async getUser(userId: string): Promise<IUser> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('user not found');
    }
    return user;
  }

  async updateUser(userId: string, user: Partial<IUser>): Promise<IUser> {
    const updatedUser = await this.userRepo.update(userId, user);
    if (!updatedUser) {
      throw new APIError('error updating user');
    }
    return updatedUser;
  }
}
