import { Schema, type HydratedDocument, type Types, model, models } from "mongoose";

export const WORKFLOW_STATUSES = ["draft", "active", "archived"] as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export interface IWorkflowNode {
  id: string;
  type?: string;
  position: {
    x: number;
    y: number;
  };
  data: Record<string, unknown>;
}

export interface IWorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data?: Record<string, unknown>;
}

export interface IWorkflowDag {
  nodes: IWorkflowNode[];
  edges: IWorkflowEdge[];
}

export interface IWorkflow {
  workspaceId: Types.ObjectId;
  name: string;
  description?: string;
  dagJson: IWorkflowDag;
  status: WorkflowStatus;
  version: number;
  tags: string[];
  createdBy: string;
  updatedBy?: string;
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkflowDocument = HydratedDocument<IWorkflow>;

const positionSchema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  { _id: false },
);

const workflowNodeSchema = new Schema<IWorkflowNode>(
  {
    id: { type: String, required: true, trim: true },
    type: { type: String, trim: true },
    position: { type: positionSchema, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const workflowEdgeSchema = new Schema<IWorkflowEdge>(
  {
    id: { type: String, required: true, trim: true },
    source: { type: String, required: true, trim: true },
    target: { type: String, required: true, trim: true },
    sourceHandle: { type: String, default: null },
    targetHandle: { type: String, default: null },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const workflowDagSchema = new Schema<IWorkflowDag>(
  {
    nodes: { type: [workflowNodeSchema], default: [] },
    edges: { type: [workflowEdgeSchema], default: [] },
  },
  { _id: false },
);

const workflowSchema = new Schema<IWorkflow>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2_000,
    },
    dagJson: {
      type: workflowDagSchema,
      default: () => ({ nodes: [], edges: [] }),
      required: true,
    },
    status: {
      type: String,
      enum: WORKFLOW_STATUSES,
      default: "draft",
      required: true,
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    updatedBy: {
      type: String,
      trim: true,
    },
    isTemplate: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

workflowSchema.index({ workspaceId: 1 });
workflowSchema.index({ status: 1 });
workflowSchema.index({ createdBy: 1 });
workflowSchema.index({ tags: 1 });

export const WorkflowModel =
  models.Workflow || model<IWorkflow>("Workflow", workflowSchema);
