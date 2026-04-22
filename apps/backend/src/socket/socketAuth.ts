/**
 * Socket Auth Middleware — Phase 25
 *
 * Verifies the Clerk session token sent in the socket handshake auth object:
 *   { auth: { token: "<clerk_session_token>" } }
 *
 * On success, attaches { userId, name, avatar } to socket.data
 * so every handler can access the authenticated user without re-verifying.
 */

import type { Socket } from "socket.io";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
): Promise<void> {
  try {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      return next(new Error("SOCKET_AUTH_MISSING_TOKEN"));
    }

    // Verify the Clerk JWT — returns the decoded payload
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    const userId = payload.sub;
    if (!userId) {
      return next(new Error("SOCKET_AUTH_INVALID_TOKEN"));
    }

    // Fetch user profile for presence display
    const user = await clerk.users.getUser(userId);

    socket.data.userId = userId;
    socket.data.name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      "Anonymous";
    socket.data.avatar = user.imageUrl ?? undefined;

    logger.debug("Socket authenticated", { socketId: socket.id, userId });
    next();
  } catch (err) {
    logger.warn("Socket auth failed", {
      socketId: socket.id,
      error: err instanceof Error ? err.message : String(err),
    });
    next(new Error("SOCKET_AUTH_FAILED"));
  }
}
