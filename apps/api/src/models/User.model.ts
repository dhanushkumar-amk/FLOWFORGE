import type { InferSchemaType, Model } from "mongoose";
import { Schema, model, models } from "mongoose";

import { USER_PLANS } from "./types";

const userSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    avatar: {
      type: String,
      trim: true
    },
    plan: {
      type: String,
      enum: USER_PLANS,
      default: "free"
    }
  },
  {
    timestamps: true
  }
);
export type User = InferSchemaType<typeof userSchema>;
export type UserModel = Model<User>;

export const UserModel =
  (models.User as UserModel | undefined) ?? model<User, UserModel>("User", userSchema);
