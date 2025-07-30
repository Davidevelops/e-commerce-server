import mongoose, { Schema, Document, Types } from "mongoose";

interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  lastlogin?: Date;
  isVerified?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: Date;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"] },
    lastlogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("user", userSchema, "user_account");
