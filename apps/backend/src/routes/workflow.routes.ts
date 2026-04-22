import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { workflowController } from '../controllers/workflow.controller';
import { dagController } from '../controllers/dag.controller';
import { createWorkflowSchema, updateWorkflowSchema, saveDagSchema } from '../validation/schemas/workflow.schema';

const router = Router();

// Workspace-scoped workflow routes
router.post(
  '/workspaces/:wsId/workflows',
  requireAuth,
  validate(createWorkflowSchema),
  workflowController.createWorkflow,
);
router.get('/workspaces/:wsId/workflows', requireAuth, workflowController.getWorkflows);

// Workflow-level routes
router.get('/:id', requireAuth, workflowController.getWorkflowById);
router.patch('/:id', requireAuth, validate(updateWorkflowSchema), workflowController.updateWorkflow);
router.delete('/:id', requireAuth, workflowController.deleteWorkflow);
router.post('/:id/duplicate', requireAuth, workflowController.duplicateWorkflow);
router.put('/:id/dag', requireAuth, validate(saveDagSchema), workflowController.saveDagJson);

// DAG validation routes (from Phase 17)
router.post('/:id/validate', requireAuth, dagController.validateWorkflow);
router.get('/:id/execution-plan', requireAuth, dagController.getExecutionPlan);

export { router as workflowRoutes };
