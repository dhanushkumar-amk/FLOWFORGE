'use client';

import { useBuilderStore, type NodeData, type NodeType } from '@/stores/builderStore';
import { NODE_TYPE_CONFIG } from './CustomNodes';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ConfigForm {
  label: string;
  description?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url?: string;
  delayMs?: number;
  channel?: string;
  message?: string;
  expression?: string;
}

interface NodeConfigPanelProps {
  workflowId: string;
}

export function NodeConfigPanel({ workflowId }: NodeConfigPanelProps) {
  const { selectedNodeId, nodes, updateNodeData, setSelectedNodeId } = useBuilderStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConfigForm>();

  // Populate form when selection changes
  useEffect(() => {
    if (selectedNode) {
      reset({
        label: selectedNode.data.label ?? '',
        description: selectedNode.data.description ?? '',
        ...(selectedNode.data.config as Record<string, unknown>),
      });
    }
  }, [selectedNode, reset]);

  if (!selectedNode) return null;

  const cfg = NODE_TYPE_CONFIG[selectedNode.data.nodeType];

  function onSave(form: ConfigForm) {
    const { label, description, ...rest } = form;
    updateNodeData(selectedNode!.id, { label, description, config: rest });
  }

  return (
    <aside className="flex flex-col w-72 h-full bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', cfg.color.replace('text-', 'bg-'))} />
          <p className="text-sm font-semibold text-foreground">Configure Node</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setSelectedNodeId(null)}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Node type badge */}
      <div className="px-4 py-2 border-b border-border">
        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-md', cfg.bg, cfg.color)}>
          {cfg.label}
        </span>
        <p className="text-xs text-muted-foreground mt-1">ID: {selectedNode.id}</p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSave)}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {/* Common fields */}
        <div className="space-y-1.5">
          <Label htmlFor="node-label">Label</Label>
          <Input id="node-label" {...register('label')} />
          {errors.label && (
            <p className="text-destructive text-xs">{errors.label.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="node-desc">Description</Label>
          <Input id="node-desc" placeholder="Optional note" {...register('description')} />
        </div>

        <Separator />

        {/* Node-type-specific fields */}
        {selectedNode.data.nodeType === 'http' && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="method">Method</Label>
              <select
                id="method"
                {...register('method')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="url">URL</Label>
              <Input id="url" placeholder="https://api.example.com/endpoint" {...register('url')} />
              {errors.url && (
                <p className="text-destructive text-xs">{errors.url.message}</p>
              )}
            </div>
          </>
        )}

        {selectedNode.data.nodeType === 'delay' && (
          <div className="space-y-1.5">
            <Label htmlFor="delayMs">Delay (ms)</Label>
            <Input id="delayMs" type="number" placeholder="1000" {...register('delayMs')} />
          </div>
        )}

        {selectedNode.data.nodeType === 'notification' && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="channel">Channel</Label>
              <Input id="channel" placeholder="#general" {...register('channel')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">Message</Label>
              <Input id="message" placeholder="Workflow completed!" {...register('message')} />
            </div>
          </>
        )}

        {selectedNode.data.nodeType === 'condition' && (
          <div className="space-y-1.5">
            <Label htmlFor="expression">Expression</Label>
            <Input
              id="expression"
              placeholder="data.status === 'ok'"
              {...register('expression')}
            />
            <p className="text-xs text-muted-foreground">
              True → bottom handle, False → right handle
            </p>
          </div>
        )}

        {selectedNode.data.nodeType === 'transform' && (
          <p className="text-xs text-muted-foreground">
            Transform nodes apply JS transformations to the payload. Full editor coming in Phase 8.
          </p>
        )}

        {selectedNode.data.nodeType === 'trigger' && (
          <p className="text-xs text-muted-foreground">
            Triggers start the workflow. Configure schedule/webhook in the settings panel.
          </p>
        )}

        <Button type="submit" size="sm" className="w-full">
          Apply Changes
        </Button>
      </form>
    </aside>
  );
}
