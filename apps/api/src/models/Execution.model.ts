import type { InferSchemaType, Model } from "mongoose";
import { Schema, Types, model, models } from "mongoose";

import { EXECUTION_STATUSES, LOG_LEVELS, TASK_STATUSES } from "./types";

const stepResultSchema = new Schema(
  {
    nodeId: {
      type: String,
      required: true
    },
    taskName: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      required: true
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    output: {
      type: Schema.Types.Mixed
    },
    error: {
      type: String
    },
    retryCount: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const executionLogSchema = new Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now
    },
    level: {
      type: String,
      enum: LOG_LEVELS,
      default: "info"
    },
    message: {
      type: String,
      required: true
    },
    nodeId: {
      type: String
    }
  },
  { _id: false }
);

const executionSchema = new Schema(
  {
    workflowId: {
      type: Types.ObjectId,
      ref: "Workflow",
      required: true
    },
    workspaceId: {
      type: Types.ObjectId,
      ref: "Workspace",
      required: true
    },
    triggeredBy: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: EXECUTION_STATUSES,
      default: "pending"
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    duration: {
      type: Number
    },
    stepResults: {
      type: [stepResultSchema],
      default: []
    },
    logs: {
      type: [executionLogSchema],
      default: []
    },
    inngestRunId: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

executionSchema.index({ workflowId: 1 });
executionSchema.index({ workspaceId: 1 });
executionSchema.index({ status: 1 });
executionSchema.index({ triggeredBy: 1 });
executionSchema.index({ startedAt: -1 });

export type Execution = InferSchemaType<typeof executionSchema>;
export type ExecutionModel = Model<Execution>;

export const ExecutionModel =
  (models.Execution as ExecutionModel | undefined) ??
  model<Execution, ExecutionModel>("Execution", executionSchema);
