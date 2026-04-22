/**
 * Presence Store — Phase 25
 *
 * Tracks which users are active in each workflow room.
 * In-memory — good enough for a single server instance.
 * For multi-instance, replace with Redis HSET/HGETALL per room.
 *
 * Structure:
 *   presenceStore.rooms  Map<workflowId, Map<userId, PresenceUser>>
 */

import type { PresenceUser } from "./events";

// Palette of distinct colors assigned round-robin to new users
const CURSOR_COLORS = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#f97316", // orange
  "#06b6d4", // cyan
];

class PresenceStore {
  // workflowId → userId → user
  private rooms = new Map<string, Map<string, PresenceUser>>();

  // socketId → { workflowId, userId } for cleanup on disconnect
  private sockets = new Map<string, { workflowId: string; userId: string }>();

  private nextColorIndex(workflowId: string): string {
    const count = this.rooms.get(workflowId)?.size ?? 0;
    return CURSOR_COLORS[count % CURSOR_COLORS.length];
  }

  join(
    workflowId: string,
    socketId: string,
    user: Omit<PresenceUser, "color">,
  ): PresenceUser {
    if (!this.rooms.has(workflowId)) {
      this.rooms.set(workflowId, new Map());
    }

    const room = this.rooms.get(workflowId)!;

    // Reuse color if user already in room (e.g. second tab)
    const existing = room.get(user.userId);
    const color = existing?.color ?? this.nextColorIndex(workflowId);

    const presenceUser: PresenceUser = { ...user, color };
    room.set(user.userId, presenceUser);

    // Track socket for disconnect cleanup
    this.sockets.set(socketId, { workflowId, userId: user.userId });

    return presenceUser;
  }

  leave(socketId: string): { workflowId: string; userId: string } | null {
    const entry = this.sockets.get(socketId);
    if (!entry) return null;

    this.sockets.delete(socketId);

    const room = this.rooms.get(entry.workflowId);
    if (room) {
      room.delete(entry.userId);
      if (room.size === 0) this.rooms.delete(entry.workflowId);
    }

    return entry;
  }

  getUsers(workflowId: string): PresenceUser[] {
    return Array.from(this.rooms.get(workflowId)?.values() ?? []);
  }

  getSocketEntry(socketId: string) {
    return this.sockets.get(socketId) ?? null;
  }
}

// Singleton
export const presenceStore = new PresenceStore();
