import type { InferSchemaType, Model } from "mongoose";
import { Schema, Types, model, models } from "mongoose";

import { TASK_STATUSES, TASK_TYPES } from "./types";

const retryPolicySchema = new Schema(
  {
    maxRetries: {
      type: Number,
      default: 3
    },
    delay: {
      type: Number,
      default: 1000
    },
    backoff: {
      type: String,
      enum: ["fixed", "exponential"],
      default: "exponential"
    }
  },
  { _id: false }
);

const taskSchema = new Schema(
  {
    workflowId: {
      type: Types.ObjectId,
      ref: "Workflow",
      required: true
    },
    nodeId: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: TASK_TYPES,
      required: true
    },
    config: {
      type: Schema.Types.Mixed,
      default: {}
    },
    dependencies: {
      type: [String],
      default: []
    },
    retryPolicy: {
      type: retryPolicySchema,
      default: () => ({})
    },
    timeout: {
      type: Number,
      default: 30000
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ workflowId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ workflowId: 1, nodeId: 1 }, { unique: true });

export type Task = InferSchemaType<typeof taskSchema>;
export type TaskModel = Model<Task>;

export const TaskModel =
  (models.Task as TaskModel | undefined) ?? model<Task, TaskModel>("Task", taskSchema);
