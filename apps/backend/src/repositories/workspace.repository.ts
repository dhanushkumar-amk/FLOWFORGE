import { type IWorkspace, type WorkspaceRole, WorkspaceModel } from "../models";
import { BaseRepository } from "./base.repository";

export class WorkspaceRepository extends BaseRepository<IWorkspace> {
  constructor() {
    super(WorkspaceModel);
  }

  async findBySlug(slug: string): Promise<IWorkspace | null> {
    return this.findOne({ slug: slug.toLowerCase() });
  }

  async findByMemberId(userId: string): Promise<IWorkspace[]> {
    return this.findMany({
      $or: [{ ownerId: userId }, { "members.userId": userId }],
    });
  }

  async addMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<IWorkspace | null> {
    return WorkspaceModel.findOneAndUpdate(
      {
        _id: workspaceId,
        "members.userId": { $ne: userId },
      },
      {
        $push: {
          members: {
            userId,
            role,
            joinedAt: new Date(),
          },
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .lean<IWorkspace>()
      .exec();
  }

  async removeMember(workspaceId: string, userId: string): Promise<IWorkspace | null> {
    return WorkspaceModel.findByIdAndUpdate(
      workspaceId,
      {
        $pull: {
          members: { userId },
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .lean<IWorkspace>()
      .exec();
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<IWorkspace | null> {
    return WorkspaceModel.findOneAndUpdate(
      {
        _id: workspaceId,
        "members.userId": userId,
      },
      {
        $set: {
          "members.$.role": role,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .lean<IWorkspace>()
      .exec();
  }
}

export const workspaceRepository = new WorkspaceRepository();
