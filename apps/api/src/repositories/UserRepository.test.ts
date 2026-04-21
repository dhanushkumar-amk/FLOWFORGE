import test from "node:test";
import assert from "node:assert/strict";

import type { User } from "../models";
import type { RepositoryModel } from "./BaseRepository";
import { UserRepository } from "./UserRepository";

function createUserRepository(items: User[]) {
  let lastFilter: unknown = null;

  const model: RepositoryModel<User> = {
    create: async (data) => data as User,
    find: (filter = {}) => ({
      lean: async () => {
        lastFilter = filter;
        return items;
      }
    }),
    findById: () => ({
      lean: async () => null
    }),
    findByIdAndUpdate: () => ({
      lean: async () => null
    }),
    findByIdAndDelete: async () => null
  };

  return {
    repository: new UserRepository(model),
    getLastFilter: () => lastFilter
  };
}

test("UserRepository queries by clerkId and email", async () => {
  const user = {
    _id: "u1",
    clerkId: "user_123",
    email: "owner@flowforge.dev",
    name: "Owner",
    plan: "free"
  } as unknown as User;

  const { repository, getLastFilter } = createUserRepository([user]);

  const byClerkId = await repository.findByClerkId("user_123");
  assert.equal(byClerkId?.clerkId, "user_123");
  assert.deepEqual(getLastFilter(), { clerkId: "user_123" });

  const byEmail = await repository.findByEmail("OWNER@FLOWFORGE.DEV");
  assert.equal(byEmail?.email, "owner@flowforge.dev");
  assert.deepEqual(getLastFilter(), { email: "owner@flowforge.dev" });
});
