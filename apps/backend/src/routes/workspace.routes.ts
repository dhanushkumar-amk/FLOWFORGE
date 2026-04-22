import { Router } from "express";
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspaceById,
  getWorkspaces,
  inviteMember,
  removeMember,
  updateMemberRole,
  updateWorkspace,
} from "../controllers/workspace.controller";
import { requireAuth } from "../middleware/auth";
import { createRequireWorkspace } from "../middleware/requireWorkspace";
import { workspaceRepository } from "../repositories";

const router = Router();
const requireWorkspaceMembership = createRequireWorkspace(({ userId, workspaceId }) =>
  workspaceRepository.isMember(workspaceId, userId),
);

router.use(requireAuth);

router.post("/", createWorkspace);
router.get("/", getWorkspaces);
router.get("/:id", requireWorkspaceMembership, getWorkspaceById);
router.patch("/:id", requireWorkspaceMembership, updateWorkspace);
router.delete("/:id", requireWorkspaceMembership, deleteWorkspace);
router.post("/:id/members", requireWorkspaceMembership, inviteMember);
router.delete("/:id/members/:userId", requireWorkspaceMembership, removeMember);
router.patch("/:id/members/:userId", requireWorkspaceMembership, updateMemberRole);

export { router as workspaceRoutes };
