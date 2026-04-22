import type { FilterQuery } from "mongoose";
import { type IWorkflow, WorkflowModel } from "../models";
import { BaseRepository } from "./base.repository";

export class WorkflowRepository extends BaseRepository<IWorkflow> {
  constructor() {
    super(WorkflowModel);
  }

  async findByWorkspace(
    workspaceId: string,
    filter: FilterQuery<IWorkflow> = {},
  ): Promise<IWorkflow[]> {
    return this.findMany({
      ...filter,
      workspaceId,
    });
  }

  async findTemplates(): Promise<IWorkflow[]> {
    return this.findMany({ isTemplate: true, status: "active" });
  }

  async incrementVersion(id: string): Promise<IWorkflow | null> {
    return WorkflowModel.findByIdAndUpdate(
      id,
      {
        $inc: { version: 1 },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .lean<IWorkflow>()
      .exec();
  }

  async searchByTags(tags: string[]): Promise<IWorkflow[]> {
    return this.findMany({
      tags: { $in: tags },
    });
  }
}

export const workflowRepository = new WorkflowRepository();
