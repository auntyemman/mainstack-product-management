import { Schema, model, Document, Model } from 'mongoose';
import { UserRole } from './user.dto';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  addresses: Array<IAddress>;
  deletedAt: Date;
}

export interface IAddress extends Document {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Address Subschema
const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

// User Schema
const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.user, index: true },
    addresses: [AddressSchema],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const User: Model<IUser> = model<IUser>('User', UserSchema);
