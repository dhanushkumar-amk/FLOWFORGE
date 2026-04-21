import type { WorkspaceRole } from "../models";

declare global {
  namespace Express {
    interface Request {
      currentUserId?: string;
      workspace?: {
        id: string;
        role: WorkspaceRole;
      };
    }
  }
}

export {};
