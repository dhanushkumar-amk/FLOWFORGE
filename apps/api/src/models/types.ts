import type { InferSchemaType, HydratedDocument, Types } from "mongoose";

export const USER_PLANS = ["free", "pro"] as const;
export const WORKSPACE_PLANS = ["free", "pro"] as const;
export const WORKSPACE_ROLES = ["owner", "admin", "member", "viewer"] as const;
export const WORKFLOW_STATUSES = ["draft", "active", "archived"] as const;
export const TASK_TYPES = ["manual", "automated", "api", "condition", "delay", "ai"] as const;
export const TASK_STATUSES = ["pending", "running", "completed", "failed", "skipped"] as const;
export const EXECUTION_STATUSES = [
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled"
] as const;
export const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;

export type UserPlan = (typeof USER_PLANS)[number];
export type WorkspacePlan = (typeof WORKSPACE_PLANS)[number];
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];
export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];
export type TaskType = (typeof TASK_TYPES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];
export type LogLevel = (typeof LOG_LEVELS)[number];

export interface DagNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: Record<string, unknown>;
}

export interface DagEdge {
  id: string;
  source: string;
  target: string;
  data?: Record<string, unknown>;
}

export interface DagJson {
  nodes: DagNode[];
  edges: DagEdge[];
}

export interface WorkspaceMemberInput {
  userId: string;
  role: WorkspaceRole;
  joinedAt?: Date;
}

export interface RetryPolicy {
  maxRetries: number;
  delay: number;
  backoff: "fixed" | "exponential";
}

export interface StepResultInput {
  nodeId: string;
  taskName: string;
  status: TaskStatus;
  startedAt?: Date;
  completedAt?: Date;
  output?: unknown;
  error?: string;
  retryCount: number;
}

export interface ExecutionLogInput {
  timestamp?: Date;
  level: LogLevel;
  message: string;
  nodeId?: string;
}

export type ObjectId = Types.ObjectId;
export type MongooseDocument<TSchema> = HydratedDocument<InferSchemaType<TSchema>>;
