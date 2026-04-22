/**
 * Socket.io Server Initializer — Phase 25
 *
 * Call initSocketServer(httpServer) once after the Express server starts.
 * Returns the io instance so it can be exported for use in other modules
 * (e.g. emit notifications from REST controllers).
 */

import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { env } from "../config/env";
import { socketAuthMiddleware } from "./socketAuth";
import {
  handleJoinWorkflow,
  handleLeaveWorkflow,
  handleDagUpdate,
  handleCursorMove,
  handleNodeSelect,
  handleDisconnect,
} from "./workflowHandlers";
import { EVENTS } from "./events";
import { logger } from "../utils/logger";

let io: Server | null = null;

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS,
      credentials: true,
    },
    // Send heartbeat every 25s, disconnect after 60s of silence
    pingInterval: 25_000,
    pingTimeout: 60_000,
  });

  // ── Auth middleware (runs before "connection" event) ──────────────────────
  io.use(socketAuthMiddleware);

  // ── Per-connection handler ────────────────────────────────────────────────
  io.on("connection", (socket) => {
    logger.info("Socket connected", {
      socketId: socket.id,
      userId: socket.data.userId,
    });

    // Register all workflow room events
    socket.on(EVENTS.JOIN_WORKFLOW, handleJoinWorkflow(io!, socket));
    socket.on(EVENTS.LEAVE_WORKFLOW, handleLeaveWorkflow(io!, socket));
    socket.on(EVENTS.DAG_UPDATE, handleDagUpdate(io!, socket));
    socket.on(EVENTS.CURSOR_MOVE, handleCursorMove(io!, socket));
    socket.on(EVENTS.NODE_SELECT, handleNodeSelect(io!, socket));

    // Cleanup on disconnect
    socket.on("disconnect", handleDisconnect(io!, socket));
  });

  logger.info("Socket.io server initialized");
  return io;
}

/** Get the running io instance (throws if called before initSocketServer) */
export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized yet");
  return io;
}
