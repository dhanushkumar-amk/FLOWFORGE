import type { InferSchemaType, Model } from "mongoose";
import { Schema, Types, model, models } from "mongoose";

const auditLogSchema = new Schema(
  {
    workspaceId: {
      type: Types.ObjectId,
      ref: "Workspace",
      required: true
    },
    userId: {
      type: String,
      trim: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    resource: {
      type: String,
      trim: true
    },
    resourceId: {
      type: String,
      trim: true
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      trim: true
    },
    userAgent: {
      type: String,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

auditLogSchema.index({ workspaceId: 1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ timestamp: -1 });

export type AuditLog = InferSchemaType<typeof auditLogSchema>;
export type AuditLogModel = Model<AuditLog>;

export const AuditLogModel =
  (models.AuditLog as AuditLogModel | undefined) ??
  model<AuditLog, AuditLogModel>("AuditLog", auditLogSchema);
