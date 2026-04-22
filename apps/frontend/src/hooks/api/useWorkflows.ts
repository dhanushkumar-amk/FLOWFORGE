'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DagJson {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, unknown>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    data?: Record<string, unknown>;
  }>;
}

export interface Workflow {
  _id: string;
  workspaceId: string;
  name: string;
  description?: string;
  dagJson: DagJson;
  status: 'draft' | 'active' | 'archived';
  version: number;
  tags: string[];
  createdBy: string;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── List workflows in a workspace ───────────────────────────────────────────

interface WorkflowFilters {
  status?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

export function useWorkflows(wsId: string | undefined, filters?: WorkflowFilters) {
  return useQuery({
    queryKey: ['workflows', wsId, filters],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Workflow[] }>(
        `/api/workspaces/${wsId}/workflows`,
        { params: filters },
      );
      return res.data.data;
    },
    enabled: !!wsId,
  });
}

// ─── Single workflow ──────────────────────────────────────────────────────────

export function useWorkflow(id: string | undefined) {
  return useQuery({
    queryKey: ['workflow', id],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Workflow }>(
        `/api/workflows/${id}`,
      );
      return res.data.data;
    },
    enabled: !!id,
  });
}

// ─── Create workflow ──────────────────────────────────────────────────────────

interface CreateWorkflowInput {
  name: string;
  description?: string;
  tags?: string[];
}

export function useCreateWorkflow(wsId: string | undefined) {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateWorkflowInput) => {
      const res = await apiClient.post<{ success: boolean; data: Workflow }>(
        `/api/workspaces/${wsId}/workflows`,
        data,
      );
      return res.data.data;
    },
    onSuccess: (workflow) => {
      qc.invalidateQueries({ queryKey: ['workflows', wsId] });
      toast.success(`Workflow "${workflow.name}" created!`);
      router.push(`/workflows/${workflow._id}/builder`);
    },
  });
}

// ─── Update workflow metadata ─────────────────────────────────────────────────

interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'archived';
  tags?: string[];
}

export function useUpdateWorkflow(id: string | undefined) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateWorkflowInput) => {
      const res = await apiClient.patch<{ success: boolean; data: Workflow }>(
        `/api/workflows/${id}`,
        data,
      );
      return res.data.data;
    },
    onSuccess: (workflow) => {
      qc.invalidateQueries({ queryKey: ['workflow', id] });
      qc.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow updated');
    },
  });
}

// ─── Save DAG JSON ────────────────────────────────────────────────────────────

export function useSaveDag(id: string | undefined) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (dagJson: DagJson) => {
      const res = await apiClient.put<{ success: boolean; data: Workflow }>(
        `/api/workflows/${id}/dag`,
        { dagJson },
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflow', id] });
    },
  });
}

// ─── Delete workflow ──────────────────────────────────────────────────────────

export function useDeleteWorkflow(wsId: string | undefined) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/workflows/${id}`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows', wsId] });
      toast.success('Workflow deleted');
    },
  });
}

// ─── Duplicate workflow ───────────────────────────────────────────────────────

export function useDuplicateWorkflow(wsId: string | undefined) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<{ success: boolean; data: Workflow }>(
        `/api/workflows/${id}/duplicate`,
      );
      return res.data.data;
    },
    onSuccess: (workflow) => {
      qc.invalidateQueries({ queryKey: ['workflows', wsId] });
      toast.success(`Duplicated as "${workflow.name}"`);
    },
  });
}

// ─── Validate DAG ─────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  executionOrder: string[];
  errors: string[];
}

export function useValidateWorkflow() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<{ success: boolean; data: ValidationResult }>(
        `/api/workflows/${id}/validate`,
      );
      return res.data.data;
    },
  });
}

// ─── Get execution plan ───────────────────────────────────────────────────────

export interface ExecutionPlan {
  order: string[];
  parallelGroups: string[][];
  criticalPath: string[];
}

export function useExecutionPlan(id: string | undefined) {
  return useQuery({
    queryKey: ['execution-plan', id],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: ExecutionPlan }>(
        `/api/workflows/${id}/execution-plan`,
      );
      return res.data.data;
    },
    enabled: !!id,
  });
}
