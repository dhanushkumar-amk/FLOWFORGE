import { z } from "zod";
import { WORKSPACE_ROLES } from "../../models";

export const workspaceSettingsSchema = z
  .object({
    maxWorkflows: z.number().int().min(1).optional(),
    maxMembers: z.number().int().min(1).optional(),
    maxExecutionsPerMonth: z.number().int().min(0).optional(),
  })
  .strict();

export const createWorkspaceSchema = z
  .object({
    name: z.string().trim().min(3).max(50),
    description: z.string().trim().max(500).optional(),
  })
  .strict();

export const updateWorkspaceSchema = z
  .object({
    name: z.string().trim().min(3).max(50).optional(),
    description: z.string().trim().max(500).optional(),
    settings: workspaceSettingsSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const inviteMemberSchema = z
  .object({
    email: z.string().trim().email(),
    role: z.enum(WORKSPACE_ROLES),
  })
  .strict();

export const updateMemberRoleSchema = z
  .object({
    role: z.enum(WORKSPACE_ROLES),
  })
  .strict();

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
