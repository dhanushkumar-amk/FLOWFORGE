/**
 * DAG Routes
 *
 * Mounted under /api/workflows in index.ts.
 *
 * POST /api/workflows/:id/validate        → validate stored dagJson
 * GET  /api/workflows/:id/execution-plan  → get topological order + parallel groups
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { dagController } from '../controllers/dag.controller';

const router = Router();

// Both routes require an authenticated user
router.post('/:id/validate', requireAuth, dagController.validateWorkflow);
router.get('/:id/execution-plan', requireAuth, dagController.getExecutionPlan);

export { router as dagRoutes };
