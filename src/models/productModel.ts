import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  properties: { key: string; value: string }[];
  price: number;
  quantity: number;
  imageUrl?: string[];
}

const productSchema = new Schema({
  name: String,
  description: String,
  properties: [{ key: { type: String }, value: { type: String } }],
  price: Number,
  quantity: Number,
  imageUrl: [String],
});

export const Product = mongoose.model<IProduct>(
  "product",
  productSchema,
  "products"
);
