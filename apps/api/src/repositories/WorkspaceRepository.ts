import type { FilterQuery } from "mongoose";

import { WorkspaceModel, type Workspace, type WorkspaceRole } from "../models";
import { BaseRepository, type RepositoryModel } from "./BaseRepository";

export class WorkspaceRepository extends BaseRepository<Workspace> {
  constructor(model: RepositoryModel<Workspace> = WorkspaceModel) {
    super(model);
  }

  async findByUserId(userId: string): Promise<Workspace[]> {
    return this.findAll({ "members.userId": userId } as FilterQuery<Workspace>);
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    const workspaces = await this.findAll({ slug } as FilterQuery<Workspace>);
    return workspaces[0] ?? null;
  }

  async findAccessibleWorkspace(workspaceId: string, userId: string): Promise<Workspace | null> {
    const workspaces = await this.findAll({
      _id: workspaceId,
      "members.userId": userId
    } as FilterQuery<Workspace>);

    return workspaces[0] ?? null;
  }

  async slugExists(slug: string): Promise<boolean> {
    return Boolean(await this.findBySlug(slug));
  }

  getMembershipRole(workspace: Workspace, userId: string): WorkspaceRole | null {
    return workspace.members.find((member) => member.userId === userId)?.role ?? null;
  }
}

export const workspaceRepository = new WorkspaceRepository();
