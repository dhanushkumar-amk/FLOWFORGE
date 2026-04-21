import { disconnectDatabase, connectDatabase } from "../lib/db";
import {
  AuditLogModel,
  ExecutionModel,
  TaskModel,
  UserModel,
  WorkflowModel,
  WorkspaceModel
} from "../models";

async function seed(): Promise<void> {
  await connectDatabase();

  await Promise.all([
    AuditLogModel.deleteMany({}),
    ExecutionModel.deleteMany({}),
    TaskModel.deleteMany({}),
    WorkflowModel.deleteMany({}),
    WorkspaceModel.deleteMany({}),
    UserModel.deleteMany({})
  ]);

  const user = await UserModel.create({
    clerkId: "user_seed_owner",
    email: "owner@flowforge.dev",
    name: "FlowForge Owner",
    avatar: "https://api.dicebear.com/9.x/initials/svg?seed=FlowForge+Owner",
    plan: "pro"
  });

  const workspace = await WorkspaceModel.create({
    name: "FlowForge HQ",
    slug: "flowforge-hq",
    ownerId: user.clerkId,
    members: [
      {
        userId: user.clerkId,
        role: "owner",
        joinedAt: new Date()
      }
    ],
    plan: "pro",
    settings: {
      maxWorkflows: 100,
      maxMembers: 25,
      retentionDays: 90
    }
  });

  const workflow = await WorkflowModel.create({
    workspaceId: workspace._id,
    name: "Customer Onboarding",
    description: "Sample workflow for approvals and welcome emails.",
    dagJson: {
      nodes: [
        {
          id: "trigger-1",
          type: "trigger",
          position: { x: 120, y: 80 },
          data: { label: "Signup Trigger" }
        },
        {
          id: "task-1",
          type: "manual",
          position: { x: 420, y: 80 },
          data: { label: "Review Account" }
        },
        {
          id: "task-2",
          type: "api",
          position: { x: 720, y: 80 },
          data: { label: "Send Welcome Email" }
        }
      ],
      edges: [
        {
          id: "edge-1",
          source: "trigger-1",
          target: "task-1"
        },
        {
          id: "edge-2",
          source: "task-1",
          target: "task-2"
        }
      ]
    },
    status: "active",
    version: 1,
    tags: ["onboarding", "email"],
    createdBy: user.clerkId,
    updatedBy: user.clerkId,
    isTemplate: false
  });

  await TaskModel.insertMany([
    {
      workflowId: workflow._id,
      nodeId: "task-1",
      name: "Review Account",
      type: "manual",
      config: {
        assigneeRole: "admin"
      },
      dependencies: ["trigger-1"],
      retryPolicy: {
        maxRetries: 2,
        delay: 1000,
        backoff: "fixed"
      },
      timeout: 60000,
      status: "completed"
    },
    {
      workflowId: workflow._id,
      nodeId: "task-2",
      name: "Send Welcome Email",
      type: "api",
      config: {
        method: "POST",
        endpoint: "https://example.com/hooks/welcome"
      },
      dependencies: ["task-1"],
      retryPolicy: {
        maxRetries: 3,
        delay: 2000,
        backoff: "exponential"
      },
      timeout: 30000,
      status: "completed"
    }
  ]);

  const execution = await ExecutionModel.create({
    workflowId: workflow._id,
    workspaceId: workspace._id,
    triggeredBy: user.clerkId,
    status: "completed",
    startedAt: new Date(Date.now() - 45_000),
    completedAt: new Date(),
    duration: 45_000,
    stepResults: [
      {
        nodeId: "task-1",
        taskName: "Review Account",
        status: "completed",
        startedAt: new Date(Date.now() - 45_000),
        completedAt: new Date(Date.now() - 25_000),
        output: {
          approved: true
        },
        retryCount: 0
      },
      {
        nodeId: "task-2",
        taskName: "Send Welcome Email",
        status: "completed",
        startedAt: new Date(Date.now() - 24_000),
        completedAt: new Date(),
        output: {
          deliveryId: "msg_seed_001"
        },
        retryCount: 1
      }
    ],
    logs: [
      {
        level: "info",
        message: "Execution started",
        nodeId: "trigger-1"
      },
      {
        level: "info",
        message: "Manual review completed",
        nodeId: "task-1"
      },
      {
        level: "info",
        message: "Welcome email sent",
        nodeId: "task-2"
      }
    ],
    inngestRunId: "seed-run-001"
  });

  await AuditLogModel.insertMany([
    {
      workspaceId: workspace._id,
      userId: user.clerkId,
      action: "workspace.created",
      resource: "workspace",
      resourceId: workspace._id.toString(),
      metadata: {
        plan: workspace.plan
      },
      ipAddress: "127.0.0.1",
      userAgent: "seed-script"
    },
    {
      workspaceId: workspace._id,
      userId: user.clerkId,
      action: "workflow.created",
      resource: "workflow",
      resourceId: workflow._id.toString(),
      metadata: {
        tags: workflow.tags
      },
      ipAddress: "127.0.0.1",
      userAgent: "seed-script"
    },
    {
      workspaceId: workspace._id,
      userId: user.clerkId,
      action: "execution.completed",
      resource: "execution",
      resourceId: execution._id.toString(),
      metadata: {
        duration: execution.duration
      },
      ipAddress: "127.0.0.1",
      userAgent: "seed-script"
    }
  ]);

  console.log("Seeded FlowForge sample data successfully.");
}

void seed()
  .catch((error: unknown) => {
    console.error("Failed to seed sample data.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
