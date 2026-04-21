import type { InferSchemaType, Model } from "mongoose";
import { Schema, model, models } from "mongoose";

import { WORKSPACE_PLANS, WORKSPACE_ROLES } from "./types";

const workspaceMemberSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: WORKSPACE_ROLES,
      required: true,
      default: "member"
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: false
  }
);

const workspaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    ownerId: {
      type: String,
      required: true,
      trim: true
    },
    members: {
      type: [workspaceMemberSchema],
      default: []
    },
    plan: {
      type: String,
      enum: WORKSPACE_PLANS,
      default: "free"
    },
    settings: {
      maxWorkflows: {
        type: Number,
        default: 10
      },
      maxMembers: {
        type: Number,
        default: 5
      },
      retentionDays: {
        type: Number,
        default: 30
      }
    }
  },
  {
    timestamps: true
  }
);

workspaceSchema.index({ slug: 1 }, { unique: true });
workspaceSchema.index({ ownerId: 1 });
workspaceSchema.index({ "members.userId": 1 });

export type Workspace = InferSchemaType<typeof workspaceSchema>;
export type WorkspaceModel = Model<Workspace>;

export const WorkspaceModel =
  (models.Workspace as WorkspaceModel | undefined) ??
  model<Workspace, WorkspaceModel>("Workspace", workspaceSchema);
