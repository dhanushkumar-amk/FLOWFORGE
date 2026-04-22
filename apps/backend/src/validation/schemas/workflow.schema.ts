import { z } from "zod";
import { WORKFLOW_STATUSES } from "../../models";

const jsonRecordSchema = z.record(z.unknown());

export const dagNodeSchema = z
  .object({
    id: z.string().trim().min(1),
    type: z.string().trim().min(1).optional(),
    position: z
      .object({
        x: z.number(),
        y: z.number(),
      })
      .strict(),
    data: jsonRecordSchema.default({}),
  })
  .strict();

export const dagEdgeSchema = z
  .object({
    id: z.string().trim().min(1),
    source: z.string().trim().min(1),
    target: z.string().trim().min(1),
    sourceHandle: z.string().trim().min(1).nullable().optional(),
    targetHandle: z.string().trim().min(1).nullable().optional(),
    data: jsonRecordSchema.optional(),
  })
  .strict();

export const dagJsonSchema = z
  .object({
    nodes: z.array(dagNodeSchema),
    edges: z.array(dagEdgeSchema),
  })
  .strict()
  .superRefine((dag, ctx) => {
    const nodeIds = new Set(dag.nodes.map((node) => node.id));

    dag.edges.forEach((edge, index) => {
      if (!nodeIds.has(edge.source)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["edges", index, "source"],
          message: "Edge source must reference an existing node",
        });
      }

      if (!nodeIds.has(edge.target)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["edges", index, "target"],
          message: "Edge target must reference an existing node",
        });
      }
    });
  });

export const createWorkflowSchema = z
  .object({
    name: z.string().trim().min(3).max(160),
    description: z.string().trim().max(2_000).optional(),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  })
  .strict();

export const updateWorkflowSchema = z
  .object({
    name: z.string().trim().min(3).max(160).optional(),
    description: z.string().trim().max(2_000).optional(),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
    status: z.enum(WORKFLOW_STATUSES).optional(),
    dagJson: dagJsonSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
export type DagJsonInput = z.infer<typeof dagJsonSchema>;

export const saveDagSchema = z
  .object({
    dagJson: dagJsonSchema,
  })
  .strict();

export type SaveDagInput = z.infer<typeof saveDagSchema>;

