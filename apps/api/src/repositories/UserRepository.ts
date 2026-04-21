import type { FilterQuery } from "mongoose";

import { UserModel, type User } from "../models";
import { BaseRepository, type RepositoryModel } from "./BaseRepository";

export class UserRepository extends BaseRepository<User> {
  constructor(model: RepositoryModel<User> = UserModel) {
    super(model);
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    const users = await this.findAll({ clerkId } as FilterQuery<User>);
    return users[0] ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findAll({ email: email.toLowerCase() } as FilterQuery<User>);
    return users[0] ?? null;
  }
}

export const userRepository = new UserRepository();
