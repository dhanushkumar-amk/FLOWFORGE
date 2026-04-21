import type { InferSchemaType, Model } from "mongoose";
import { Schema, Types, model, models } from "mongoose";

import { WORKFLOW_STATUSES } from "./types";

const dagNodeSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    },
    data: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  { _id: false }
);

const dagEdgeSchema = new Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    data: {
      type: Schema.Types.Mixed
    }
  },
  { _id: false }
);

const workflowSchema = new Schema(
  {
    workspaceId: {
      type: Types.ObjectId,
      ref: "Workspace",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    dagJson: {
      nodes: {
        type: [dagNodeSchema],
        default: []
      },
      edges: {
        type: [dagEdgeSchema],
        default: []
      }
    },
    status: {
      type: String,
      enum: WORKFLOW_STATUSES,
      default: "draft"
    },
    version: {
      type: Number,
      default: 1
    },
    tags: {
      type: [String],
      default: []
    },
    createdBy: {
      type: String,
      required: true,
      trim: true
    },
    updatedBy: {
      type: String,
      required: true,
      trim: true
    },
    isTemplate: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

workflowSchema.index({ workspaceId: 1 });
workflowSchema.index({ status: 1 });
workflowSchema.index({ createdBy: 1 });
workflowSchema.index({ tags: 1 });

export type Workflow = InferSchemaType<typeof workflowSchema>;
export type WorkflowModel = Model<Workflow>;

export const WorkflowModel =
  (models.Workflow as WorkflowModel | undefined) ??
  model<Workflow, WorkflowModel>("Workflow", workflowSchema);
