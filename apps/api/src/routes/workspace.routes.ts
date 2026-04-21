import { Router } from "express";
import { isValidObjectId } from "mongoose";

import type { Workflow, Workspace, WorkspaceRole } from "../models";
import { requireWorkspaceAccess, requireWorkspaceRole } from "../middleware/requireWorkspace";
import { workflowRepository, workspaceRepository } from "../repositories";
import { slugifyWorkspaceName } from "../utils/slugify";

const workspaceRouter = Router();
type WorkspaceRecord = Workspace & { _id: { toString(): string } };
type WorkflowRecord = Workflow & { _id: { toString(): string } };

workspaceRouter.get("/", async (req, res) => {
  const userId = req.currentUserId;

  if (!userId) {
    res.status(401).json({
      error: "Unauthorized"
    });
    return;
  }

  const workspaces = (await workspaceRepository.findByUserId(userId)) as WorkspaceRecord[];
  const sortedWorkspaces = [...workspaces].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  res.json({
    data: sortedWorkspaces.map((workspace) => {
      const role = workspaceRepository.getMembershipRole(workspace, userId);

      return {
        id: String(workspace._id),
        name: workspace.name,
        slug: workspace.slug,
        plan: workspace.plan,
        role,
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

  if (!userId) {
    res.status(401).json({
      error: "Unauthorized"
    });
    return;
  }

  if (!rawName || rawName.length < 3) {
    res.status(422).json({
      error: "Workspace name must be at least 3 characters long"
    });
    return;
  }

  const baseSlug = slugifyWorkspaceName(rawName);
  let slug = baseSlug || `workspace-${Date.now()}`;
  let suffix = 1;

  while (await workspaceRepository.slugExists(slug)) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const workspace = (await workspaceRepository.create({
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
  } as unknown as Partial<Workspace>)) as WorkspaceRecord;

  res.status(201).json({
    data: {
      id: String(workspace._id),
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
  if (!userId) {
    res.status(401).json({
      error: "Unauthorized"
    });
    return;
  }

  const workspace = (await workspaceRepository.findById(req.workspace!.id)) as WorkspaceRecord | null;

  if (!workspace) {
    res.status(404).json({
      error: "Workspace not found"
    });
    return;
  }

  const workflows = (await workflowRepository.findByWorkspaceId(req.workspace!.id)) as WorkflowRecord[];
  const recentWorkflows = [...workflows]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 20);

  const role = workspaceRepository.getMembershipRole(workspace, userId);

  res.json({
    data: {
      id: String(workspace._id),
      name: workspace.name,
      slug: workspace.slug,
      ownerId: workspace.ownerId,
      role,
      plan: workspace.plan,
      settings: workspace.settings,
      members: workspace.members,
      workflowCount: workflows.length,
      recentWorkflows: recentWorkflows.map((workflow) => ({
        id: String(workflow._id),
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
  const workspace = (await workspaceRepository.findById(req.workspace!.id)) as WorkspaceRecord | null;

  if (!workspace) {
    res.status(404).json({
      error: "Workspace not found"
    });
    return;
  }

  res.json({
    data: {
      activeWorkspaceId: String(workspace._id),
      role: req.workspace?.role,
      workspace: {
        id: String(workspace._id),
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

    const workflows = (await workflowRepository.findByWorkspaceId(workspaceId)) as WorkflowRecord[];

    await Promise.all(workflows.map((workflow) => workflowRepository.delete(String(workflow._id))));
    await workspaceRepository.delete(workspaceId);

    res.status(204).send();
  }
);

export { workspaceRouter };
