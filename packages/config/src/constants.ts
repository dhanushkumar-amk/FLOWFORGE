export const API_ROUTES = {
  AUTH: "/api/auth",
  USERS: "/api/users",
  WORKSPACES: "/api/workspaces",
  WORKFLOWS: "/api/workflows",
  EXECUTIONS: "/api/executions",
  HEALTH: "/health",
} as const;

export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  WORKFLOW_STARTED: "workflow:started",
  WORKFLOW_UPDATED: "workflow:updated",
  WORKFLOW_COMPLETED: "workflow:completed",
  WORKFLOW_FAILED: "workflow:failed",
  EXECUTION_LOG: "execution:log",
} as const;

export const WORKFLOW_LIMITS = {
  MAX_NODES: 100,
  MAX_EDGES: 200,
  MAX_NAME_LENGTH: 120,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_EXECUTION_LOG_SIZE: 10_000,
} as const;

export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  WORKFLOW_LIMIT_EXCEEDED: "WORKFLOW_LIMIT_EXCEEDED",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;
