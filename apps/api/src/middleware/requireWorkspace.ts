import type { NextFunction, Request, Response } from "express";

import { workspaceRepository } from "../repositories";

const ALLOWED_ROLES = new Set(["owner", "admin", "member"] as const);

export async function requireWorkspaceAccess(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.currentUserId;
  const routeWorkspaceId = req.params.workspaceId;
  const workspaceHeader = req.header("x-workspace-id");
  const workspaceId =
    (Array.isArray(routeWorkspaceId) ? routeWorkspaceId[0] : routeWorkspaceId) ??
    (Array.isArray(workspaceHeader) ? workspaceHeader[0] : workspaceHeader);

  if (!userId) {
    res.status(401).json({
      error: "Unauthorized"
    });
    return;
  }

  if (!workspaceId) {
    res.status(400).json({
      error: "workspaceId is required"
    });
    return;
  }

  const workspace = await workspaceRepository.findAccessibleWorkspace(workspaceId, userId);

  if (!workspace) {
    res.status(403).json({
      error: "Forbidden"
    });
    return;
  }

  const role = workspaceRepository.getMembershipRole(workspace, userId);

  if (!role || !ALLOWED_ROLES.has(role)) {
    res.status(403).json({
      error: "Forbidden"
    });
    return;
  }

  req.workspace = {
    id: workspaceId,
    role
  };

  next();
}

export function requireWorkspaceRole(roles: Array<"owner" | "admin" | "member">) {
  const allowed = new Set(roles);

  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.workspace || !allowed.has(req.workspace.role)) {
      res.status(403).json({
        error: "Forbidden"
      });
      return;
    }

    next();
  };
}
