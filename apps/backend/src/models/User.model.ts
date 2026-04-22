import { Schema, type HydratedDocument, model, models } from "mongoose";

export const USER_PLANS = ["free", "pro"] as const;

export type UserPlan = (typeof USER_PLANS)[number];

export interface IUser {
  clerkId: string;
  email: string;
  name: string;
  avatar?: string;
  plan: UserPlan;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    avatar: {
      type: String,
      trim: true,
    },
    plan: {
      type: String,
      enum: USER_PLANS,
      default: "free",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ clerkId: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

export const UserModel = models.User || model<IUser>("User", userSchema);
