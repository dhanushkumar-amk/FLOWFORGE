import test from "node:test";
import assert from "node:assert/strict";

import type { Execution } from "../models";
import type { RepositoryModel } from "./BaseRepository";
import { ExecutionRepository } from "./ExecutionRepository";

test("ExecutionRepository can query by workflowId and workspaceId", async () => {
  const filters: unknown[] = [];

  const model: RepositoryModel<Execution> = {
    create: async (data) => data as Execution,
    find: (filter = {}) => ({
      lean: async () => {
        filters.push(filter);
        return [] as Execution[];
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

  const repository = new ExecutionRepository(model);

  await repository.findByWorkspaceId("ws_1");
  await repository.findByWorkflowId("wf_1");

  assert.deepEqual(filters, [{ workspaceId: "ws_1" }, { workflowId: "wf_1" }]);
});
