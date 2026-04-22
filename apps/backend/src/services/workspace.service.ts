import { clerkClient } from "@clerk/express";
import { Types } from "mongoose";
import type { IWorkspace, WorkspaceRole } from "../models";
import { userRepository, workspaceRepository } from "../repositories";
import { AppError } from "../utils/AppError";

export interface CreateWorkspaceInput {
  name: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  settings?: Partial<IWorkspace["settings"]>;
}

export interface InviteMemberInput {
  email: string;
  role: WorkspaceRole;
}

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const ensureObjectId = (id: string): void => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid workspace id", 400);
  }
};

export class WorkspaceService {
  async createWorkspace(data: CreateWorkspaceInput, ownerId: string): Promise<IWorkspace> {
    const baseSlug = slugify(data.name);

    if (!baseSlug) {
      throw new AppError("Workspace name must contain letters or numbers", 400);
    }

    let slug = baseSlug;
    let suffix = 1;

    while (await workspaceRepository.findBySlug(slug)) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    return workspaceRepository.create({
      name: data.name,
      slug,
      ownerId,
      members: [
        {
          userId: ownerId,
          role: "OWNER",
          joinedAt: new Date(),
        },
      ],
    });
  }

  async getUserWorkspaces(userId: string): Promise<IWorkspace[]> {
    return workspaceRepository.findByMemberId(userId);
  }

  async getWorkspaceById(workspaceId: string, userId: string): Promise<IWorkspace> {
    ensureObjectId(workspaceId);

    const workspace = await workspaceRepository.findOne({
      _id: workspaceId,
      isDeleted: false,
      $or: [{ ownerId: userId }, { "members.userId": userId }],
    });

    if (!workspace) {
      throw new AppError("Workspace not found", 404);
    }

    return workspace;
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    data: UpdateWorkspaceInput,
  ): Promise<IWorkspace> {
    const workspace = await this.getWorkspaceById(workspaceId, userId);
    this.assertCanManageWorkspace(workspace, userId);
    const update: Record<string, unknown> = {};

    if (data.name !== undefined) {
      update.name = data.name;
    }

    if (data.settings?.maxWorkflows !== undefined) {
      update["settings.maxWorkflows"] = data.settings.maxWorkflows;
    }

    if (data.settings?.maxMembers !== undefined) {
      update["settings.maxMembers"] = data.settings.maxMembers;
    }

    if (data.settings?.maxExecutionsPerMonth !== undefined) {
      update["settings.maxExecutionsPerMonth"] = data.settings.maxExecutionsPerMonth;
    }

    const updated = await workspaceRepository.updateById(workspaceId, {
      $set: update,
    });

    if (!updated) {
      throw new AppError("Workspace not found", 404);
    }

    return updated;
  }

  async deleteWorkspace(workspaceId: string, userId: string): Promise<IWorkspace> {
    const workspace = await this.getWorkspaceById(workspaceId, userId);

    if (workspace.ownerId !== userId) {
      throw new AppError("Only the workspace owner can delete this workspace", 403);
    }

    const deleted = await workspaceRepository.updateById(workspaceId, {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    if (!deleted) {
      throw new AppError("Workspace not found", 404);
    }

    return deleted;
  }

  async inviteMember(
    workspaceId: string,
    actorId: string,
    input: InviteMemberInput,
  ): Promise<IWorkspace> {
    const workspace = await this.getWorkspaceById(workspaceId, actorId);
    this.assertCanManageWorkspace(workspace, actorId);

    await clerkClient.invitations.createInvitation({
      emailAddress: input.email,
      notify: true,
      publicMetadata: {
        workspaceId,
        workspaceSlug: workspace.slug,
        role: input.role,
      },
    });

    const invitedUser = await userRepository.findByEmail(input.email);

    if (!invitedUser) {
      return workspace;
    }

    const updated = await workspaceRepository.addMember(workspaceId, invitedUser.clerkId, input.role);

    return updated ?? workspace;
  }

  async removeMember(workspaceId: string, actorId: string, userId: string): Promise<IWorkspace> {
    const workspace = await this.getWorkspaceById(workspaceId, actorId);
    this.assertCanManageWorkspace(workspace, actorId);

    if (workspace.ownerId === userId) {
      throw new AppError("Workspace owner cannot be removed", 400);
    }

    const updated = await workspaceRepository.removeMember(workspaceId, userId);

    if (!updated) {
      throw new AppError("Workspace not found", 404);
    }

    return updated;
  }

  async updateMemberRole(
    workspaceId: string,
    actorId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<IWorkspace> {
    const workspace = await this.getWorkspaceById(workspaceId, actorId);
    this.assertCanManageWorkspace(workspace, actorId);

    if (workspace.ownerId === userId) {
      throw new AppError("Workspace owner role cannot be changed", 400);
    }

    const updated = await workspaceRepository.updateMemberRole(workspaceId, userId, role);

    if (!updated) {
      throw new AppError("Workspace member not found", 404);
    }

    return updated;
  }

  private assertCanManageWorkspace(workspace: IWorkspace, userId: string): void {
    const memberRole = workspace.members.find((member) => member.userId === userId)?.role;

    if (workspace.ownerId !== userId && memberRole !== "ADMIN" && memberRole !== "OWNER") {
      throw new AppError("Workspace admin access required", 403);
    }
  }
}

export const workspaceService = new WorkspaceService();
