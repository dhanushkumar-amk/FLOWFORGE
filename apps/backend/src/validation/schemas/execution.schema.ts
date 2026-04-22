import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

export const triggerExecutionSchema = z
  .object({
    workflowId: objectIdSchema,
    input: z.record(z.unknown()).optional(),
  })
  .strict();

export type TriggerExecutionInput = z.infer<typeof triggerExecutionSchema>;
