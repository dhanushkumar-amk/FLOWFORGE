import type { TaskStatus, WorkflowStatus } from "./workflow.types";

export interface IExecution {
  id: string;
  workflowId: string;
  workspaceId: string;
  status: WorkflowStatus;
  triggeredBy: string;
  startedAt: string;
  completedAt?: string;
  tasks: IExecutionTask[];
  logs: ExecutionLog[];
}

export interface IExecutionTask {
  taskId: string;
  nodeId: string;
  status: TaskStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface ExecutionLog {
  id: string;
  executionId: string;
  taskId?: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}
