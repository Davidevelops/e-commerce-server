import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  user: mongoose.Schema.Types.ObjectId; // reference to the user who made the order
  products: {
    product: mongoose.Schema.Types.ObjectId; // reference to the product
    price: number;
    quantity: number;
  };
  totalAmount: number;
  paymentStatus: "pending" | "completed" | "failed";
  paymentMethod: "COD" | "gcash" | "paymaya";
  shippingAddress: {
    street: string;
    baranggay: string;
    city: string;
    province: string;
  };
  orderStatus: "processing" | "shipped" | "delivered";
}

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  products: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  totalAmount: Number,
  paymentStatus: { type: String, enum: ["pending", "completed", "failed"] },
  paymentMethod: { type: String, enum: ["COD", "gcash", "paymaya"] },
  shippingAddress: {
    street: { type: String, required: true },
    baranggay: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
  },
  orderStatus: { type: String, enum: ["processing", "shipped", "delivered"] },
});

export const Order = mongoose.model<IOrder>("Order", orderSchema, "orders");
