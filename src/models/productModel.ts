import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  properties: { key: string; value: string }[];
  price: number;
  category: string;
  imageUrl?: string[];
  isPopular: boolean;
}

const productSchema = new Schema(
  {
    name: String,
    description: String,
    properties: [{ key: { type: String }, value: { type: String } }],
    category: String,
    price: Number,
    imageUrl: [String],
    isPopular: Boolean,
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model<IProduct>(
  "product",
  productSchema,
  "products"
);
