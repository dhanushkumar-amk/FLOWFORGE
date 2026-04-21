import test from "node:test";
import assert from "node:assert/strict";

import type { FilterQuery, UpdateQuery } from "mongoose";

import { BaseRepository, type RepositoryModel } from "./BaseRepository";

interface DemoDocument {
  id: string;
  name: string;
}

class DemoRepository extends BaseRepository<DemoDocument> {
  constructor(model: RepositoryModel<DemoDocument>) {
    super(model);
  }
}

function createMockModel() {
  const state = {
    items: [{ id: "1", name: "alpha" }],
    deletedId: "",
    updatedWith: null as UpdateQuery<DemoDocument> | null,
    createdWith: null as Partial<DemoDocument> | null,
    lastFilter: null as FilterQuery<DemoDocument> | null
  };

  const model: RepositoryModel<DemoDocument> = {
    create: async (data) => {
      state.createdWith = data;
      return { id: "2", name: String(data.name ?? "") };
    },
    find: (filter = {}) => ({
      lean: async () => {
        state.lastFilter = filter;
        return state.items;
      }
    }),
    findById: (id) => ({
      lean: async () => state.items.find((item) => item.id === id) ?? null
    }),
    findByIdAndUpdate: (id, data) => ({
      lean: async () => {
        state.updatedWith = data;
        return state.items.find((item) => item.id === id)
          ? { id, name: String((data as { name?: string }).name ?? "alpha") }
          : null;
      }
    }),
    findByIdAndDelete: async (id) => {
      state.deletedId = id;
      return state.items.find((item) => item.id === id) ?? null;
    }
  };

  return { model, state };
}

test("BaseRepository exposes generic CRUD methods", async () => {
  const { model, state } = createMockModel();
  const repository = new DemoRepository(model);

  const found = await repository.findById("1");
  const all = await repository.findAll({ name: "alpha" });
  const created = await repository.create({ name: "beta" });
  const updated = await repository.update("1", { name: "gamma" });
  const deleted = await repository.delete("1");

  assert.deepEqual(found, { id: "1", name: "alpha" });
  assert.deepEqual(all, [{ id: "1", name: "alpha" }]);
  assert.deepEqual(created, { id: "2", name: "beta" });
  assert.deepEqual(updated, { id: "1", name: "gamma" });
  assert.equal(deleted, true);
  assert.deepEqual(state.createdWith, { name: "beta" });
  assert.deepEqual(state.updatedWith, { name: "gamma" });
  assert.deepEqual(state.lastFilter, { name: "alpha" });
  assert.equal(state.deletedId, "1");
});
