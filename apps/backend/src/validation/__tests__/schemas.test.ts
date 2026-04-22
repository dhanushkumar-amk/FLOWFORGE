import { ZodError } from "zod";
import { formatZodErrors } from "../../utils/formatZodErrors";
import {
  createWorkflowSchema,
  createWorkspaceSchema,
  dagJsonSchema,
  inviteMemberSchema,
  triggerExecutionSchema,
  updateWorkspaceSchema,
} from "../schemas";

describe("workspace schemas", () => {
  it("accepts a valid workspace create payload", () => {
    const result = createWorkspaceSchema.parse({
      name: "Product Ops",
      description: "Internal workflow automation",
    });

    expect(result).toEqual({
      name: "Product Ops",
      description: "Internal workflow automation",
    });
  });

  it("rejects short workspace names", () => {
    const result = createWorkspaceSchema.safeParse({ name: "PM" });

    expect(result.success).toBe(false);
  });

  it("accepts a partial workspace update with settings", () => {
    const result = updateWorkspaceSchema.parse({
      settings: {
        maxWorkflows: 20,
        maxMembers: 5,
      },
    });

    expect(result.settings?.maxWorkflows).toBe(20);
  });

  it("rejects empty workspace updates", () => {
    const result = updateWorkspaceSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("validates member invitations", () => {
    const result = inviteMemberSchema.safeParse({
      email: "member@example.com",
      role: "ADMIN",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid member roles", () => {
    const result = inviteMemberSchema.safeParse({
      email: "member@example.com",
      role: "SUPER_ADMIN",
    });

    expect(result.success).toBe(false);
  });
});

describe("workflow schemas", () => {
  it("accepts a valid workflow create payload", () => {
    const result = createWorkflowSchema.parse({
      name: "Lead Qualification",
      description: "Score incoming leads",
      tags: ["sales", "ai"],
    });

    expect(result.tags).toEqual(["sales", "ai"]);
  });

  it("accepts a valid DAG", () => {
    const result = dagJsonSchema.safeParse({
      nodes: [
        { id: "start", type: "manual", position: { x: 0, y: 0 }, data: {} },
        { id: "score", type: "ai", position: { x: 200, y: 0 }, data: {} },
      ],
      edges: [{ id: "edge-1", source: "start", target: "score" }],
    });

    expect(result.success).toBe(true);
  });

  it("rejects DAG edges that reference missing nodes", () => {
    const result = dagJsonSchema.safeParse({
      nodes: [{ id: "start", position: { x: 0, y: 0 }, data: {} }],
      edges: [{ id: "edge-1", source: "start", target: "missing" }],
    });

    expect(result.success).toBe(false);
  });
});

describe("execution schemas", () => {
  it("accepts a trigger execution payload", () => {
    const result = triggerExecutionSchema.safeParse({
      workflowId: "64f0c4b7a3b9d7a1f8c2e901",
      input: { priority: "high" },
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid workflow ids", () => {
    const result = triggerExecutionSchema.safeParse({
      workflowId: "not-an-id",
    });

    expect(result.success).toBe(false);
  });
});

describe("formatZodErrors", () => {
  it("formats zod issues into API error details", () => {
    try {
      createWorkspaceSchema.parse({ name: "PM" });
      throw new Error("Expected schema parse to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);

      const details = formatZodErrors(error as ZodError);

      expect(details[0]).toMatchObject({
        path: "name",
        code: "too_small",
      });
    }
  });
});
