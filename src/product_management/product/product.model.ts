import { Schema, model, Document, Model } from 'mongoose';
import { ProductStatus } from './product.dto';

// Product Document Interface definition
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: Array<string>;
  tags: Array<string>;
  status: ProductStatus;
  createdBy: Schema.Types.ObjectId | string;
}

// Product Schema
const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, index: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0, index: true },
    category: [{ type: String, required: true, index: true }],
    tags: [{ type: String, trim: true, index: true }],
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.unpublished,
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const Product: Model<IProduct> = model<IProduct>('Product', ProductSchema);
