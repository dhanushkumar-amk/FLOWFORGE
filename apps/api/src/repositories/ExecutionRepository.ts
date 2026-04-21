import type { FilterQuery } from "mongoose";

import { ExecutionModel, type Execution } from "../models";
import { BaseRepository, type RepositoryModel } from "./BaseRepository";

export class ExecutionRepository extends BaseRepository<Execution> {
  constructor(model: RepositoryModel<Execution> = ExecutionModel) {
    super(model);
  }

  async findByWorkspaceId(workspaceId: string): Promise<Execution[]> {
    return this.findAll({ workspaceId } as FilterQuery<Execution>);
  }

  async findByWorkflowId(workflowId: string): Promise<Execution[]> {
    return this.findAll({ workflowId } as FilterQuery<Execution>);
  }
}

export const executionRepository = new ExecutionRepository();
