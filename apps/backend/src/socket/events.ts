/**
 * Socket.io Event Types — Phase 25
 *
 * Single source of truth for all event names and their payloads.
 * Both the server-side handlers and the frontend useSocket hook
 * import from here (or from packages/shared-types once wired up).
 *
 * Naming convention:
 *   CLIENT → SERVER  :  "workflow:<action>"
 *   SERVER → CLIENT  :  "workflow:<action>"   (same name, different direction)
 *   SERVER → CLIENT  :  "presence:<action>"
 */

// ─── Connection / Auth ────────────────────────────────────────────────────────

export interface SocketAuth {
  token: string; // Clerk session token
}

// ─── Room naming helper ───────────────────────────────────────────────────────

export const ROOM = {
  workflow: (id: string) => `workflow:${id}`,
  workspace: (id: string) => `workspace:${id}`,
} as const;

// ─── Event names ──────────────────────────────────────────────────────────────

export const EVENTS = {
  // Client → Server
  JOIN_WORKFLOW: "workflow:join",
  LEAVE_WORKFLOW: "workflow:leave",
  DAG_UPDATE: "workflow:dag_update",
  CURSOR_MOVE: "workflow:cursor_move",
  NODE_SELECT: "workflow:node_select",

  // Server → Client
  DAG_UPDATED: "workflow:dag_updated",
  CURSOR_MOVED: "workflow:cursor_moved",
  NODE_SELECTED: "workflow:node_selected",
  PRESENCE_UPDATE: "presence:update",
  USER_JOINED: "presence:user_joined",
  USER_LEFT: "presence:user_left",

  // Server → Client (errors)
  ERROR: "error",
} as const;

// ─── Payload types ────────────────────────────────────────────────────────────

export interface JoinWorkflowPayload {
  workflowId: string;
}

export interface LeaveWorkflowPayload {
  workflowId: string;
}

export interface DagUpdatePayload {
  workflowId: string;
  dagJson: {
    nodes: unknown[];
    edges: unknown[];
  };
}

export interface CursorMovePayload {
  workflowId: string;
  x: number;
  y: number;
}

export interface NodeSelectPayload {
  workflowId: string;
  nodeId: string | null;
}

export interface PresenceUser {
  userId: string;
  name: string;
  avatar?: string;
  color: string; // Hex color assigned to this user's cursor
}

export interface PresenceUpdatePayload {
  workflowId: string;
  users: PresenceUser[];
}

export interface UserJoinedPayload {
  workflowId: string;
  user: PresenceUser;
}

export interface UserLeftPayload {
  workflowId: string;
  userId: string;
}

export interface CursorMovedPayload {
  workflowId: string;
  userId: string;
  x: number;
  y: number;
}

export interface NodeSelectedPayload {
  workflowId: string;
  userId: string;
  nodeId: string | null;
}
