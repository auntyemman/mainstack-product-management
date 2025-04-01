import { Schema, model, Model, Document } from 'mongoose';

// Inventory Document Interface definition
export interface IInventory extends Document {
  product: Schema.Types.ObjectId | string;
  quantity: number;
  location: string;
}

// Inventory Schema
const InventorySchema = new Schema<IInventory>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, },
    quantity: { type: Number, required: true, min: 0 },
    location: { type: String, index: true, required: true },
  },
  { timestamps: true },
);

export const Inventory: Model<IInventory> = model<IInventory>('Inventory', InventorySchema);
