import { Schema, type HydratedDocument, type Types, model, models } from "mongoose";
import { TASK_STATUSES, type TaskStatus } from "./Task.model";

export const EXECUTION_STATUSES = ["pending", "running", "completed", "failed", "cancelled"] as const;
export const EXECUTION_LOG_LEVELS = ["debug", "info", "warn", "error"] as const;

export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];
export type ExecutionLogLevel = (typeof EXECUTION_LOG_LEVELS)[number];

export interface IExecutionStepResult {
  nodeId: string;
  taskName: string;
  status: TaskStatus;
  startedAt?: Date;
  completedAt?: Date;
  output?: Record<string, unknown>;
  error?: string;
  retryCount: number;
}

export interface IExecutionLog {
  timestamp: Date;
  level: ExecutionLogLevel;
  message: string;
  nodeId?: string;
}

export interface IExecution {
  workflowId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  triggeredBy: string;
  status: ExecutionStatus;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  stepResults: IExecutionStepResult[];
  logs: IExecutionLog[];
  inngestRunId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ExecutionDocument = HydratedDocument<IExecution>;

const executionStepResultSchema = new Schema<IExecutionStepResult>(
  {
    nodeId: { type: String, required: true, trim: true },
    taskName: { type: String, required: true, trim: true },
    status: { type: String, enum: TASK_STATUSES, required: true },
    startedAt: { type: Date },
    completedAt: { type: Date },
    output: { type: Schema.Types.Mixed },
    error: { type: String },
    retryCount: { type: Number, default: 0, min: 0, required: true },
  },
  { _id: false },
);

const executionLogSchema = new Schema<IExecutionLog>(
  {
    timestamp: { type: Date, default: Date.now, required: true },
    level: { type: String, enum: EXECUTION_LOG_LEVELS, required: true },
    message: { type: String, required: true },
    nodeId: { type: String, trim: true },
  },
  { _id: false },
);

const executionSchema = new Schema<IExecution>(
  {
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    triggeredBy: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: EXECUTION_STATUSES,
      default: "pending",
      required: true,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    duration: {
      type: Number,
      min: 0,
    },
    stepResults: {
      type: [executionStepResultSchema],
      default: [],
    },
    logs: {
      type: [executionLogSchema],
      default: [],
    },
    inngestRunId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

executionSchema.index({ workflowId: 1 });
executionSchema.index({ workspaceId: 1 });
executionSchema.index({ status: 1 });
executionSchema.index({ triggeredBy: 1 });
executionSchema.index({ startedAt: -1 });

export const ExecutionModel =
  models.Execution || model<IExecution>("Execution", executionSchema);
