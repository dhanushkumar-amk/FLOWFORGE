import type { UpdateQuery } from "mongoose";
import { type IUser, UserModel } from "../models";
import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(UserModel);
  }

  async findByClerkId(clerkId: string): Promise<IUser | null> {
    return this.findOne({ clerkId });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email: email.toLowerCase() });
  }

  async deleteByClerkId(clerkId: string): Promise<boolean> {
    const result = await UserModel.findOneAndDelete({ clerkId }).exec();
    return result !== null;
  }

  async updateByClerkId(clerkId: string, data: UpdateQuery<IUser>): Promise<IUser | null> {
    return UserModel.findOneAndUpdate(
      { clerkId },
      data,
      {
        new: true,
        runValidators: true,
      },
    )
      .lean<IUser>()
      .exec();
  }

  async upsertByClerkId(clerkId: string, data: UpdateQuery<IUser>): Promise<IUser> {
    return UserModel.findOneAndUpdate(
      { clerkId },
      {
        $set: {
          ...data,
          clerkId,
        },
      },
      {
        new: true,
        runValidators: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    )
      .lean<IUser>()
      .orFail()
      .exec();
  }
}

export const userRepository = new UserRepository();
