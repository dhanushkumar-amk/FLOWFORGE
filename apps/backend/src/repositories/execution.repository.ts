import { Types, type FilterQuery } from "mongoose";
import {
  type ExecutionStatus,
  type IExecution,
  type IExecutionLog,
  type IExecutionStepResult,
  ExecutionModel,
} from "../models";
import { BaseRepository } from "./base.repository";

export interface ExecutionStats {
  total: number;
  byStatus: Record<ExecutionStatus, number>;
  averageDuration: number;
}

const defaultExecutionStats: ExecutionStats = {
  total: 0,
  byStatus: {
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  },
  averageDuration: 0,
};

export class ExecutionRepository extends BaseRepository<IExecution> {
  constructor() {
    super(ExecutionModel);
  }

  async findByWorkflow(
    workflowId: string,
    filter: FilterQuery<IExecution> = {},
  ): Promise<IExecution[]> {
    return this.findMany(
      {
        ...filter,
        workflowId,
      },
      {
        sort: { startedAt: -1, createdAt: -1 },
      },
    );
  }

  async getExecutionStats(workspaceId: string): Promise<ExecutionStats> {
    const [stats] = await ExecutionModel.aggregate<ExecutionStats>([
      { $match: { workspaceId: new Types.ObjectId(workspaceId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          averageDuration: { $avg: "$duration" },
          statuses: {
            $push: "$status",
          },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          averageDuration: { $ifNull: ["$averageDuration", 0] },
          byStatus: {
            pending: {
              $size: {
                $filter: {
                  input: "$statuses",
                  cond: { $eq: ["$$this", "pending"] },
                },
              },
            },
            running: {
              $size: {
                $filter: {
                  input: "$statuses",
                  cond: { $eq: ["$$this", "running"] },
                },
              },
            },
            completed: {
              $size: {
                $filter: {
                  input: "$statuses",
                  cond: { $eq: ["$$this", "completed"] },
                },
              },
            },
            failed: {
              $size: {
                $filter: {
                  input: "$statuses",
                  cond: { $eq: ["$$this", "failed"] },
                },
              },
            },
            cancelled: {
              $size: {
                $filter: {
                  input: "$statuses",
                  cond: { $eq: ["$$this", "cancelled"] },
                },
              },
            },
          },
        },
      },
    ]).exec();

    return stats ?? defaultExecutionStats;
  }

  async appendLog(id: string, log: IExecutionLog): Promise<void> {
    await ExecutionModel.findByIdAndUpdate(id, {
      $push: {
        logs: log,
      },
    }).exec();
  }

  async updateStepResult(
    id: string,
    nodeId: string,
    result: Partial<IExecutionStepResult>,
  ): Promise<void> {
    const updated = await ExecutionModel.updateOne(
      {
        _id: id,
        "stepResults.nodeId": nodeId,
      },
      {
        $set: {
          "stepResults.$": {
            ...result,
            nodeId,
          },
        },
      },
      {
        runValidators: true,
      },
    ).exec();

    if (updated.matchedCount === 0) {
      await ExecutionModel.findByIdAndUpdate(
        id,
        {
          $push: {
            stepResults: {
              ...result,
              nodeId,
            },
          },
        },
        {
          runValidators: true,
        },
      ).exec();
    }
  }
}

export const executionRepository = new ExecutionRepository();
