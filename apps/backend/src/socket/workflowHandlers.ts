/**
 * Workflow Socket Handlers — Phase 25
 *
 * One function per client event. Each handler:
 *   1. Validates the payload shape
 *   2. Performs the action (join room, broadcast to others, etc.)
 *   3. Emits back to the correct audience
 *
 * All handlers receive the authenticated socket so socket.data.userId
 * is always available.
 */

import type { Server, Socket } from "socket.io";
import { presenceStore } from "./presenceStore";
import {
  EVENTS,
  ROOM,
  type JoinWorkflowPayload,
  type LeaveWorkflowPayload,
  type DagUpdatePayload,
  type CursorMovePayload,
  type NodeSelectPayload,
} from "./events";
import { logger } from "../utils/logger";

// ─── Join ─────────────────────────────────────────────────────────────────────

export function handleJoinWorkflow(io: Server, socket: Socket) {
  return async (payload: JoinWorkflowPayload) => {
    const { workflowId } = payload;
    if (!workflowId) return;

    const room = ROOM.workflow(workflowId);
    await socket.join(room);

    // Register in presence store and get back the colored user object
    const presenceUser = presenceStore.join(workflowId, socket.id, {
      userId: socket.data.userId,
      name: socket.data.name,
      avatar: socket.data.avatar,
    });

    // Tell the joining user about everyone already in the room
    socket.emit(EVENTS.PRESENCE_UPDATE, {
      workflowId,
      users: presenceStore.getUsers(workflowId),
    });

    // Tell everyone else a new user joined
    socket.to(room).emit(EVENTS.USER_JOINED, {
      workflowId,
      user: presenceUser,
    });

    logger.debug("User joined workflow room", {
      socketId: socket.id,
      userId: socket.data.userId,
      workflowId,
    });
  };
}

// ─── Leave ────────────────────────────────────────────────────────────────────

export function handleLeaveWorkflow(io: Server, socket: Socket) {
  return async (payload: LeaveWorkflowPayload) => {
    const { workflowId } = payload;
    if (!workflowId) return;

    const room = ROOM.workflow(workflowId);
    await socket.leave(room);

    presenceStore.leave(socket.id);

    socket.to(room).emit(EVENTS.USER_LEFT, {
      workflowId,
      userId: socket.data.userId,
    });
  };
}

// ─── DAG update (collaborative edit broadcast) ────────────────────────────────

export function handleDagUpdate(io: Server, socket: Socket) {
  return (payload: DagUpdatePayload) => {
    const { workflowId, dagJson } = payload;
    if (!workflowId || !dagJson) return;

    // Broadcast to everyone else in the room (not back to sender)
    socket.to(ROOM.workflow(workflowId)).emit(EVENTS.DAG_UPDATED, {
      workflowId,
      dagJson,
      updatedBy: socket.data.userId,
    });
  };
}

// ─── Cursor move ──────────────────────────────────────────────────────────────

export function handleCursorMove(io: Server, socket: Socket) {
  return (payload: CursorMovePayload) => {
    const { workflowId, x, y } = payload;
    if (!workflowId || x == null || y == null) return;

    socket.to(ROOM.workflow(workflowId)).emit(EVENTS.CURSOR_MOVED, {
      workflowId,
      userId: socket.data.userId,
      x,
      y,
    });
  };
}

// ─── Node select ──────────────────────────────────────────────────────────────

export function handleNodeSelect(io: Server, socket: Socket) {
  return (payload: NodeSelectPayload) => {
    const { workflowId, nodeId } = payload;
    if (!workflowId) return;

    socket.to(ROOM.workflow(workflowId)).emit(EVENTS.NODE_SELECTED, {
      workflowId,
      userId: socket.data.userId,
      nodeId,
    });
  };
}

// ─── Disconnect cleanup ───────────────────────────────────────────────────────

export function handleDisconnect(io: Server, socket: Socket) {
  return () => {
    const entry = presenceStore.leave(socket.id);
    if (!entry) return;

    const { workflowId, userId } = entry;

    io.to(ROOM.workflow(workflowId)).emit(EVENTS.USER_LEFT, {
      workflowId,
      userId,
    });

    logger.debug("Socket disconnected — removed from presence", {
      socketId: socket.id,
      userId,
      workflowId,
    });
  };
}
