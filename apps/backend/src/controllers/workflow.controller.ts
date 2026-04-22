import type { NextFunction, Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { workflowService } from '../services/workflow.service';
import { AppError } from '../utils/AppError';

export const workflowController = {
  // POST /api/workspaces/:wsId/workflows
  async createWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = getAuth(req);
      if (!userId) throw new AppError('Unauthorized', 401);
      const workflow = await workflowService.createWorkflow(
        req.body,
        req.params.wsId,
        userId,
      );
      res.status(201).json({ success: true, data: workflow });
    } catch (err) { next(err); }
  },

  // GET /api/workspaces/:wsId/workflows
  async getWorkflows(req: Request, res: Response, next: NextFunction) {
    try {
      const workflows = await workflowService.getWorkflows(
        req.params.wsId,
        req.query as any,
      );
      res.json({ success: true, data: workflows });
    } catch (err) { next(err); }
  },

  // GET /api/workflows/:id
  async getWorkflowById(req: Request, res: Response, next: NextFunction) {
    try {
      const workflow = await workflowService.getWorkflowById(req.params.id);
      if (!workflow) throw new AppError('Workflow not found', 404);
      res.json({ success: true, data: workflow });
    } catch (err) { next(err); }
  },

  // PATCH /api/workflows/:id
  async updateWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = getAuth(req);
      if (!userId) throw new AppError('Unauthorized', 401);
      const workflow = await workflowService.updateWorkflow(req.params.id, req.body, userId);
      res.json({ success: true, data: workflow });
    } catch (err) { next(err); }
  },

  // DELETE /api/workflows/:id
  async deleteWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      await workflowService.deleteWorkflow(req.params.id);
      res.json({ success: true, data: null });
    } catch (err) { next(err); }
  },

  // POST /api/workflows/:id/duplicate
  async duplicateWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = getAuth(req);
      if (!userId) throw new AppError('Unauthorized', 401);
      const workflow = await workflowService.duplicateWorkflow(req.params.id, userId);
      res.status(201).json({ success: true, data: workflow });
    } catch (err) { next(err); }
  },

  // PUT /api/workflows/:id/dag
  async saveDagJson(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = getAuth(req);
      if (!userId) throw new AppError('Unauthorized', 401);
      const workflow = await workflowService.saveDag(
        req.params.id,
        req.body.dagJson,
        userId,
      );
      res.json({ success: true, data: workflow });
    } catch (err) { next(err); }
  },
};
