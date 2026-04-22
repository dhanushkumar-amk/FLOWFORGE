'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useBuilderStore } from '@/stores/builderStore';
import type { Edge, Node } from 'reactflow';
import type { NodeData } from '@/stores/builderStore';

export function useImportExport(workflowName: string) {
  const { nodes, edges, setNodes, setEdges, markDirty } = useBuilderStore();

  // ── Export ────────────────────────────────────────────────────────────────

  const exportDag = useCallback(() => {
    const dagJson = {
      version: '1.0',
      name: workflowName,
      exportedAt: new Date().toISOString(),
      nodes,
      edges,
    };

    const blob = new Blob([JSON.stringify(dagJson, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflowName.replace(/\s+/g, '_').toLowerCase()}.flowforge.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Workflow exported');
  }, [nodes, edges, workflowName]);

  // ── Import ─────────────────────────────────────────────────────────────────

  const importDag = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.flowforge.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Validate minimal structure
        if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
          throw new Error('Invalid FlowForge export file');
        }

        setNodes(data.nodes as Node<NodeData>[]);
        setEdges(data.edges as Edge[]);
        markDirty();
        toast.success(`Imported ${data.nodes.length} nodes from "${file.name}"`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to import file');
      }
    };
    input.click();
  }, [setNodes, setEdges, markDirty]);

  return { exportDag, importDag };
}
