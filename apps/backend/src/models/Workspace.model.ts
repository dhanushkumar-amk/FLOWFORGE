import { Schema, type HydratedDocument, model, models } from "mongoose";
import { USER_PLANS, type UserPlan } from "./User.model";

export const WORKSPACE_ROLES = ["OWNER", "ADMIN", "MEMBER", "VIEWER"] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export interface IWorkspaceMember {
  userId: string;
  role: WorkspaceRole;
  joinedAt: Date;
}

export interface IWorkspaceSettings {
  maxWorkflows: number;
  maxMembers: number;
  maxExecutionsPerMonth: number;
}

export interface IWorkspace {
  name: string;
  slug: string;
  ownerId: string;
  members: IWorkspaceMember[];
  plan: UserPlan;
  settings: IWorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkspaceDocument = HydratedDocument<IWorkspace>;

const workspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: WORKSPACE_ROLES,
      default: "MEMBER",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { _id: false },
);

const workspaceSettingsSchema = new Schema<IWorkspaceSettings>(
  {
    maxWorkflows: {
      type: Number,
      default: 10,
      min: 1,
      required: true,
    },
    maxMembers: {
      type: Number,
      default: 3,
      min: 1,
      required: true,
    },
    maxExecutionsPerMonth: {
      type: Number,
      default: 1_000,
      min: 0,
      required: true,
    },
  },
  { _id: false },
);

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    ownerId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    members: {
      type: [workspaceMemberSchema],
      default: [],
    },
    plan: {
      type: String,
      enum: USER_PLANS,
      default: "free",
      required: true,
    },
    settings: {
      type: workspaceSettingsSchema,
      default: () => ({}),
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

workspaceSchema.index({ slug: 1 }, { unique: true });
workspaceSchema.index({ ownerId: 1 });
workspaceSchema.index({ "members.userId": 1 });

export const WorkspaceModel =
  models.Workspace || model<IWorkspace>("Workspace", workspaceSchema);
