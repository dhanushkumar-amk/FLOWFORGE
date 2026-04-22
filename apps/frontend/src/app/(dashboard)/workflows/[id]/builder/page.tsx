'use client';

import { useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, Download, Loader2, Play, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkflow, useSaveDag, useValidateWorkflow } from '@/hooks/api/useWorkflows';
import { useBuilderStore } from '@/stores/builderStore';
import { useImportExport } from '@/hooks/useImportExport';
import { DagCanvas } from '@/components/dag-builder/DagCanvas';
import { NodeToolbox } from '@/components/dag-builder/NodeToolbox';
import { NodeConfigPanel } from '@/components/dag-builder/NodeConfigPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { Edge, Node } from 'reactflow';
import type { NodeData } from '@/stores/builderStore';


export default function WorkflowBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const { data: workflow, isLoading } = useWorkflow(id);
  const saveMutation = useSaveDag(id);
  const validateMutation = useValidateWorkflow();
  const { isDirty, lastSaved, selectedNodeId } = useBuilderStore();
  const { exportDag, importDag } = useImportExport(workflow?.name ?? 'workflow');

  const handleSave = useCallback(
    async (dagJson: { nodes: Node<NodeData>[]; edges: Edge[] }) => {
      await saveMutation.mutateAsync(dagJson as any);
    },
    [saveMutation],
  );

  const handleManualSave = useCallback(async () => {
    const { nodes, edges } = useBuilderStore.getState();
    await handleSave({ nodes, edges });
    toast.success('Workflow saved');
  }, [handleSave]);

  const handleValidate = useCallback(async () => {
    if (!id) return;
    const result = await validateMutation.mutateAsync(id);
    if (result.valid) {
      toast.success(`Valid DAG — ${result.executionOrder.length} steps`);
    } else {
      toast.error(result.errors.join('\n'));
    }
  }, [id, validateMutation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Workflow not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full -m-6">
      {/* ── Builder TopBar ── */}
      <div className="flex items-center gap-3 px-4 h-12 border-b border-border bg-card flex-shrink-0">
        <Link href="/workflows">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground truncate">{workflow.name}</h2>
            <Badge variant="secondary" className="text-xs capitalize">{workflow.status}</Badge>
          </div>
        </div>

        {/* Save status */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving…
            </>
          ) : isDirty ? (
            <>
              <Clock className="w-3 h-3" />
              Unsaved
            </>
          ) : lastSaved ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
            </>
          ) : null}
        </div>

        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5"
          onClick={importDag}
        >
          <Upload className="w-3 h-3" />
          Import
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5"
          onClick={exportDag}
        >
          <Download className="w-3 h-3" />
          Export
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5"
          onClick={handleValidate}
          disabled={validateMutation.isPending}
        >
          <Play className="w-3 h-3" />
          Validate
        </Button>
        <Button
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={handleManualSave}
          disabled={saveMutation.isPending}
        >
          <Save className="w-3 h-3" />
          Save
        </Button>
      </div>

      {/* ── Builder Body ── */}
      <div className="flex flex-1 min-h-0">
        {/* Node palette */}
        <NodeToolbox />

        {/* Canvas */}
        <div className="flex-1 min-w-0 h-full relative">
          <DagCanvas workflow={workflow} onSave={handleSave} />
        </div>

        {/* Config panel (shown when a node is selected) */}
        {selectedNodeId && <NodeConfigPanel workflowId={id} />}
      </div>
    </div>
  );
}
