import { Schema, type HydratedDocument, type Types, model, models } from "mongoose";

export const TASK_TYPES = ["manual", "automated", "api", "condition", "delay", "ai"] as const;
export const TASK_STATUSES = ["pending", "running", "completed", "failed", "skipped"] as const;
export const RETRY_BACKOFFS = ["fixed", "exponential"] as const;

export type TaskType = (typeof TASK_TYPES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type RetryBackoff = (typeof RETRY_BACKOFFS)[number];

export interface IRetryPolicy {
  maxRetries: number;
  delay: number;
  backoff: RetryBackoff;
}

export interface ITask {
  workflowId: Types.ObjectId;
  nodeId: string;
  name: string;
  type: TaskType;
  config: Record<string, unknown>;
  dependencies: string[];
  retryPolicy: IRetryPolicy;
  timeout: number;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskDocument = HydratedDocument<ITask>;

const retryPolicySchema = new Schema<IRetryPolicy>(
  {
    maxRetries: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    delay: {
      type: Number,
      default: 1_000,
      min: 0,
      required: true,
    },
    backoff: {
      type: String,
      enum: RETRY_BACKOFFS,
      default: "fixed",
      required: true,
    },
  },
  { _id: false },
);

const taskSchema = new Schema<ITask>(
  {
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
      index: true,
    },
    nodeId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    type: {
      type: String,
      enum: TASK_TYPES,
      required: true,
    },
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },
    dependencies: {
      type: [String],
      default: [],
    },
    retryPolicy: {
      type: retryPolicySchema,
      default: () => ({}),
      required: true,
    },
    timeout: {
      type: Number,
      default: 300_000,
      min: 1,
      required: true,
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({ workflowId: 1 });
taskSchema.index({ workflowId: 1, nodeId: 1 }, { unique: true });
taskSchema.index({ status: 1 });

export const TaskModel = models.Task || model<ITask>("Task", taskSchema);
