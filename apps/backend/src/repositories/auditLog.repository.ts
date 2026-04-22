import type { FilterQuery } from "mongoose";
import { type IAuditLog, AuditLogModel } from "../models";
import { BaseRepository } from "./base.repository";

export class AuditLogRepository extends BaseRepository<IAuditLog> {
  constructor() {
    super(AuditLogModel);
  }

  async logAction(data: Partial<IAuditLog>): Promise<void> {
    await this.create(data);
  }

  async findByWorkspace(
    workspaceId: string,
    filter: FilterQuery<IAuditLog> = {},
  ): Promise<IAuditLog[]> {
    return this.findMany(
      {
        ...filter,
        workspaceId,
      },
      {
        sort: { timestamp: -1 },
      },
    );
  }
}

export const auditLogRepository = new AuditLogRepository();
