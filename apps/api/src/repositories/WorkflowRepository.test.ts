import test from "node:test";
import assert from "node:assert/strict";

import type { Workflow } from "../models";
import type { RepositoryModel } from "./BaseRepository";
import { WorkflowRepository } from "./WorkflowRepository";

test("WorkflowRepository scopes workflows by workspaceId", async () => {
  let lastFilter: unknown = null;

  const model: RepositoryModel<Workflow> = {
    create: async (data) => data as Workflow,
    find: (filter = {}) => ({
      lean: async () => {
        lastFilter = filter;
        return [] as Workflow[];
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

  const repository = new WorkflowRepository(model);
  await repository.findByWorkspaceId("ws_1");

  assert.deepEqual(lastFilter, { workspaceId: "ws_1" });
});
