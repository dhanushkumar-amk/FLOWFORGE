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
import { validate } from "../middleware/validate";
import { workspaceRepository } from "../repositories";
import {
  createWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  updateWorkspaceSchema,
} from "../validation/schemas";

const router = Router();
const requireWorkspaceMembership = createRequireWorkspace(({ userId, workspaceId }) =>
  workspaceRepository.isMember(workspaceId, userId),
);

router.use(requireAuth);

router.post("/", validate(createWorkspaceSchema), createWorkspace);
router.get("/", getWorkspaces);
router.get("/:id", requireWorkspaceMembership, getWorkspaceById);
router.patch("/:id", requireWorkspaceMembership, validate(updateWorkspaceSchema), updateWorkspace);
router.delete("/:id", requireWorkspaceMembership, deleteWorkspace);
router.post("/:id/members", requireWorkspaceMembership, validate(inviteMemberSchema), inviteMember);
router.delete("/:id/members/:userId", requireWorkspaceMembership, removeMember);
router.patch(
  "/:id/members/:userId",
  requireWorkspaceMembership,
  validate(updateMemberRoleSchema),
  updateMemberRole,
);

export { router as workspaceRoutes };
