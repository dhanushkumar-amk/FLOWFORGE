import type { FilterQuery } from "mongoose";

import { WorkflowModel, type Workflow } from "../models";
import { BaseRepository, type RepositoryModel } from "./BaseRepository";

export class WorkflowRepository extends BaseRepository<Workflow> {
  constructor(model: RepositoryModel<Workflow> = WorkflowModel) {
    super(model);
  }

  async findByWorkspaceId(workspaceId: string): Promise<Workflow[]> {
    return this.findAll({ workspaceId } as FilterQuery<Workflow>);
  }
}

export const workflowRepository = new WorkflowRepository();
