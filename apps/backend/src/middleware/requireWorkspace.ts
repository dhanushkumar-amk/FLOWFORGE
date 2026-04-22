import { getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

type WorkspaceMembershipResolver = (input: {
  userId: string;
  workspaceId: string;
}) => Promise<boolean> | boolean;

const getWorkspaceId = (req: Parameters<RequestHandler>[0]): string | undefined =>
  req.params.workspaceId ??
  req.params.workspaceSlug ??
  req.params.id ??
  req.headers["x-workspace-id"]?.toString();

export const createRequireWorkspace =
  (resolveMembership: WorkspaceMembershipResolver): RequestHandler =>
  async (req, res, next) => {
    try {
      const { userId } = getAuth(req);
      const workspaceId = getWorkspaceId(req);

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
          statusCode: 401,
        });
        return;
      }

      if (!workspaceId) {
        res.status(400).json({
          success: false,
          error: "Workspace id is required",
          statusCode: 400,
        });
        return;
      }

      const isMember = await resolveMembership({ userId, workspaceId });

      if (!isMember) {
        res.status(403).json({
          success: false,
          error: "Workspace access denied",
          statusCode: 403,
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export const requireWorkspace = createRequireWorkspace(() => false);
