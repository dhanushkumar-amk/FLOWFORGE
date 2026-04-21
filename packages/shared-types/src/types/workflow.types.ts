export enum WorkflowStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum TaskStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  SKIPPED = "SKIPPED",
}

export type DagJson = {
  nodes: INode[];
  edges: IEdge[];
};

export interface IWorkflow {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  dagJson: DagJson;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITask {
  id: string;
  workflowId: string;
  nodeId: string;
  name: string;
  status: TaskStatus;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface INode {
  id: string;
  type?: string;
  position: {
    x: number;
    y: number;
  };
  data: Record<string, unknown>;
}

export interface IEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;
  data?: Record<string, unknown>;
}
