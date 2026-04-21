import { Router } from "express";
import { isValidObjectId } from "mongoose";

import { WorkspaceModel, type WorkspaceRole, WorkflowModel } from "../models";
import { requireWorkspaceAccess, requireWorkspaceRole } from "../middleware/requireWorkspace";
import { slugifyWorkspaceName } from "../utils/slugify";
import { withWorkspaceScope } from "../utils/workspaceScope";

const workspaceRouter = Router();

workspaceRouter.get("/", async (req, res) => {
  const userId = req.currentUserId;

  const workspaces = await WorkspaceModel.find({
    "members.userId": userId
  })
    .sort({ updatedAt: -1 })
    .lean();

  res.json({
    data: workspaces.map((workspace) => {
      const membership = workspace.members.find((member) => member.userId === userId);

      return {
        id: workspace._id.toString(),
        name: workspace.name,
        slug: workspace.slug,
        plan: workspace.plan,
        role: membership?.role ?? null,
        ownerId: workspace.ownerId,
        memberCount: workspace.members.length,
        settings: workspace.settings,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt
      };
    })
  });
});

workspaceRouter.post("/", async (req, res) => {
  const userId = req.currentUserId;
  const rawName = typeof req.body?.name === "string" ? req.body.name.trim() : "";

  if (!rawName || rawName.length < 3) {
    res.status(422).json({
      error: "Workspace name must be at least 3 characters long"
    });
    return;
  }

  const baseSlug = slugifyWorkspaceName(rawName);
  let slug = baseSlug || `workspace-${Date.now()}`;
  let suffix = 1;

  while (await WorkspaceModel.exists({ slug })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const workspace = await WorkspaceModel.create({
    name: rawName,
    slug,
    ownerId: userId,
    members: [
      {
        userId,
        role: "owner",
        joinedAt: new Date()
      }
    ]
  });

  res.status(201).json({
    data: {
      id: workspace._id.toString(),
      name: workspace.name,
      slug: workspace.slug,
      ownerId: workspace.ownerId,
      role: "owner" satisfies WorkspaceRole,
      plan: workspace.plan,
      settings: workspace.settings,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt
    }
  });
});

workspaceRouter.get("/:workspaceId", requireWorkspaceAccess, async (req, res) => {
  const userId = req.currentUserId;

  const workspace = await WorkspaceModel.findById(req.workspace?.id).lean();

  if (!workspace) {
    res.status(404).json({
      error: "Workspace not found"
    });
    return;
  }

  const workflows = await WorkflowModel.find(withWorkspaceScope(req.workspace!.id))
    .select("_id name status updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  const membership = workspace.members.find((member) => member.userId === userId);

  res.json({
    data: {
      id: workspace._id.toString(),
      name: workspace.name,
      slug: workspace.slug,
      ownerId: workspace.ownerId,
      role: membership?.role ?? null,
      plan: workspace.plan,
      settings: workspace.settings,
      members: workspace.members,
      workflowCount: workflows.length,
      recentWorkflows: workflows.map((workflow) => ({
        id: workflow._id.toString(),
        name: workflow.name,
        status: workflow.status,
        updatedAt: workflow.updatedAt
      })),
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt
    }
  });
});

workspaceRouter.post("/:workspaceId/switch", requireWorkspaceAccess, async (req, res) => {
  const workspace = await WorkspaceModel.findById(req.workspace?.id).lean();

  if (!workspace) {
    res.status(404).json({
      error: "Workspace not found"
    });
    return;
  }

  res.json({
    data: {
      activeWorkspaceId: workspace._id.toString(),
      role: req.workspace?.role,
      workspace: {
        id: workspace._id.toString(),
        name: workspace.name,
        slug: workspace.slug
      }
    }
  });
});

workspaceRouter.delete(
  "/:workspaceId",
  requireWorkspaceAccess,
  requireWorkspaceRole(["owner"]),
  async (req, res) => {
    const workspaceId = req.workspace?.id;

    if (!workspaceId || !isValidObjectId(workspaceId)) {
      res.status(400).json({
        error: "Invalid workspaceId"
      });
      return;
    }

    await Promise.all([
      WorkflowModel.deleteMany(withWorkspaceScope(workspaceId)),
      WorkspaceModel.findByIdAndDelete(workspaceId)
    ]);

    res.status(204).send();
  }
);

export { workspaceRouter };
