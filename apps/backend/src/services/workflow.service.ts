/**
 * Workflow Service
 *
 * Business logic for workflow CRUD + DAG saving.
 */

import { getAuth } from '@clerk/express';
import { workflowRepository } from '../repositories';
import { dagService } from './dag.service';
import { AppError } from '../utils/AppError';
import { cache } from '../utils/cache';
import { CACHE_KEYS } from '../utils/cacheKeys';

export const workflowService = {
  async createWorkflow(
    data: { name: string; description?: string; tags?: string[] },
    workspaceId: string,
    userId: string,
  ) {
    const workflow = await workflowRepository.create({
      workspaceId: workspaceId as any,
      createdBy: userId,
      updatedBy: userId,
      name: data.name,
      description: data.description ?? '',
      tags: data.tags ?? [],
      status: 'draft',
      version: 1,
      dagJson: { nodes: [], edges: [] },
      isTemplate: false,
    });

    await cache.del(CACHE_KEYS.workflowList(workspaceId));
    return workflow;
  },

  async getWorkflows(
    workspaceId: string,
    filters: { status?: string; tag?: string; page?: number; limit?: number },
  ) {
    const cacheKey = CACHE_KEYS.workflowList(workspaceId);
    return cache.getOrSet(
      cacheKey,
      async () => {
        const query: Record<string, unknown> = { workspaceId };
        if (filters.status) query.status = filters.status;
        if (filters.tag) query.tags = filters.tag;
        return workflowRepository.findMany(query, {
          sort: { updatedAt: -1 },
          limit: filters.limit ?? 50,
          skip: ((filters.page ?? 1) - 1) * (filters.limit ?? 50),
        });
      },
      300, // 5 min TTL
    );
  },

  async getWorkflowById(id: string) {
    const cacheKey = CACHE_KEYS.workflow(id);
    return cache.getOrSet(
      cacheKey,
      async () => workflowRepository.findById(id),
      600, // 10 min
    );
  },

  async updateWorkflow(
    id: string,
    data: { name?: string; description?: string; status?: string; tags?: string[] },
    userId: string,
  ) {
    const workflow = await workflowRepository.findById(id);
    if (!workflow) throw new AppError('Workflow not found', 404);

    const updated = await workflowRepository.updateById(id, {
      ...data,
      updatedBy: userId,
    });

    await Promise.all([
      cache.del(CACHE_KEYS.workflow(id)),
      cache.del(CACHE_KEYS.workflowList(String(workflow.workspaceId))),
    ]);

    return updated;
  },

  async saveDag(id: string, dagJson: { nodes: unknown[]; edges: unknown[] }, userId: string) {
    const validation = dagService.validateDagJson(dagJson as any);
    if (!validation.valid) {
      throw new AppError(`Invalid DAG: ${validation.errors.join('; ')}`, 400);
    }

    const workflow = await workflowRepository.findById(id);
    if (!workflow) throw new AppError('Workflow not found', 404);

    const updated = await workflowRepository.updateById(id, {
      dagJson,
      updatedBy: userId,
      version: (workflow.version ?? 1) + 1,
    });

    await Promise.all([
      cache.del(CACHE_KEYS.workflow(id)),
      cache.del(CACHE_KEYS.workflowList(String(workflow.workspaceId))),
    ]);

    return updated;
  },

  async deleteWorkflow(id: string) {
    const workflow = await workflowRepository.findById(id);
    if (!workflow) throw new AppError('Workflow not found', 404);

    await workflowRepository.deleteById(id);
    await Promise.all([
      cache.del(CACHE_KEYS.workflow(id)),
      cache.del(CACHE_KEYS.workflowList(String(workflow.workspaceId))),
    ]);
  },

  async duplicateWorkflow(id: string, userId: string) {
    const original = await workflowRepository.findById(id);
    if (!original) throw new AppError('Workflow not found', 404);

    const copy = await workflowRepository.create({
      workspaceId: original.workspaceId,
      name: `${original.name} (copy)`,
      description: original.description,
      dagJson: original.dagJson,
      tags: original.tags,
      status: 'draft',
      version: 1,
      isTemplate: false,
      createdBy: userId,
      updatedBy: userId,
    });

    await cache.del(CACHE_KEYS.workflowList(String(original.workspaceId)));
    return copy;
  },
};

