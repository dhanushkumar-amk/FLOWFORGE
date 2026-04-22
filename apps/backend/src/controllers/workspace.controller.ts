import { getAuth } from "@clerk/express";
import type { RequestHandler } from "express";
import { WORKSPACE_ROLES, type WorkspaceRole } from "../models";
import { workspaceService } from "../services/workspace.service";
import { AppError } from "../utils/AppError";

const getUserId = (req: Parameters<RequestHandler>[0]): string => {
  const { userId } = getAuth(req);

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  return userId;
};

const getBody = (req: Parameters<RequestHandler>[0]): Record<string, unknown> =>
  typeof req.body === "object" && req.body !== null ? (req.body as Record<string, unknown>) : {};

const getRequiredString = (value: unknown, field: string): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(`${field} is required`, 400);
  }

  return value.trim();
};

const getOptionalString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const getWorkspaceRole = (value: unknown): WorkspaceRole => {
  if (typeof value !== "string" || !WORKSPACE_ROLES.includes(value as WorkspaceRole)) {
    throw new AppError("Invalid workspace role", 400);
  }

  return value as WorkspaceRole;
};

export const createWorkspace: RequestHandler = async (req, res, next) => {
  try {
    const body = getBody(req);
    const workspace = await workspaceService.createWorkspace(
      {
        name: getRequiredString(body.name, "Workspace name"),
      },
      getUserId(req),
    );

    res.status(201).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaces: RequestHandler = async (req, res, next) => {
  try {
    const workspaces = await workspaceService.getUserWorkspaces(getUserId(req));

    res.status(200).json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceById: RequestHandler = async (req, res, next) => {
  try {
    const workspace = await workspaceService.getWorkspaceById(
      getRequiredString(req.params.id, "Workspace id"),
      getUserId(req),
    );

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkspace: RequestHandler = async (req, res, next) => {
  try {
    const body = getBody(req);
    const workspace = await workspaceService.updateWorkspace(
      getRequiredString(req.params.id, "Workspace id"),
      getUserId(req),
      {
        name: getOptionalString(body.name),
        settings:
          typeof body.settings === "object" && body.settings !== null
            ? (body.settings as Record<string, number>)
            : undefined,
      },
    );

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkspace: RequestHandler = async (req, res, next) => {
  try {
    const workspace = await workspaceService.deleteWorkspace(
      getRequiredString(req.params.id, "Workspace id"),
      getUserId(req),
    );

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const inviteMember: RequestHandler = async (req, res, next) => {
  try {
    const body = getBody(req);
    const workspace = await workspaceService.inviteMember(
      getRequiredString(req.params.id, "Workspace id"),
      getUserId(req),
      {
        email: getRequiredString(body.email, "Email"),
        role: getWorkspaceRole(body.role),
      },
    );

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember: RequestHandler = async (req, res, next) => {
  try {
    const workspace = await workspaceService.removeMember(
      getRequiredString(req.params.id, "Workspace id"),
      getUserId(req),
      getRequiredString(req.params.userId, "User id"),
    );

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMemberRole: RequestHandler = async (req, res, next) => {
  try {
    const body = getBody(req);
    const workspace = await workspaceService.updateMemberRole(
      getRequiredString(req.params.id, "Workspace id"),
      getUserId(req),
      getRequiredString(req.params.userId, "User id"),
      getWorkspaceRole(body.role),
    );

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};
