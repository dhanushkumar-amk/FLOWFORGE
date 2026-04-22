/**
 * DAG Controller
 *
 * Thin HTTP layer — delegates all logic to dag.service.ts.
 *
 * Routes:
 *   POST /api/workflows/:id/validate    → validateWorkflow()
 *   GET  /api/workflows/:id/execution-plan → getExecutionPlan()
 */

import type { NextFunction, Request, Response } from 'express';
import { dagService } from '../services/dag.service';
import { AppError } from '../utils/AppError';

// Import workflow repository to fetch dagJson from DB
import { workflowRepository } from '../repositories';

export const dagController = {
  /**
   * POST /api/workflows/:id/validate
   * Validates the stored dagJson of a workflow.
   * Returns { valid, executionOrder, errors }
   */
  async validateWorkflow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workflow = await workflowRepository.findById(req.params.id);
      if (!workflow) {
        next(new AppError('Workflow not found', 404));
        return;
      }

      const result = dagService.validateDagJson(workflow.dagJson as any);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/workflows/:id/execution-plan
   * Returns: { order, parallelGroups, criticalPath }
   */
  async getExecutionPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workflow = await workflowRepository.findById(req.params.id);
      if (!workflow) {
        next(new AppError('Workflow not found', 404));
        return;
      }

      const plan = dagService.getExecutionPlan(workflow.dagJson as any);
      res.status(200).json({ success: true, data: plan });
    } catch (err) {
      next(err);
    }
  },
};
