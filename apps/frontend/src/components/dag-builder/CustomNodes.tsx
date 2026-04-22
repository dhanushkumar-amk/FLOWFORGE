'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import type { NodeData, NodeType } from '@/stores/builderStore';

// ─── Node type config ─────────────────────────────────────────────────────────

export const NODE_TYPE_CONFIG: Record<
  NodeType,
  { label: string; color: string; bg: string; border: string }
> = {
  trigger: {
    label: 'Trigger',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
  },
  http: {
    label: 'HTTP Request',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  transform: {
    label: 'Transform',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  condition: {
    label: 'Condition',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  delay: {
    label: 'Delay',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  notification: {
    label: 'Notification',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
  },
};

// ─── Status icon ──────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status?: NodeData['status'] }) {
  if (!status || status === 'idle') return null;
  const icons: Record<string, { Icon: LucideIcon; className: string }> = {
    running: { Icon: Loader2, className: 'text-blue-400 animate-spin' },
    success: { Icon: CheckCircle2, className: 'text-green-400' },
    error: { Icon: AlertCircle, className: 'text-red-400' },
  };
  const item = icons[status];
  if (!item) return null;
  const { Icon, className } = item;
  return <Icon className={cn('w-3 h-3 flex-shrink-0', className)} />;
}

// ─── Base custom node ─────────────────────────────────────────────────────────

function BaseNode({
  data,
  selected,
  hasTargetHandle = true,
  hasSourceHandle = true,
}: NodeProps<NodeData> & {
  hasTargetHandle?: boolean;
  hasSourceHandle?: boolean;
}) {
  const config = NODE_TYPE_CONFIG[data.nodeType] ?? NODE_TYPE_CONFIG.http;

  return (
    <div
      className={cn(
        'min-w-[180px] rounded-xl border-2 transition-all duration-150 shadow-sm',
        config.bg,
        config.border,
        selected && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
      )}
    >
      {hasTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-muted-foreground/50 !border-border !w-2 !h-2"
        />
      )}

      <div className="px-3.5 py-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <Activity className={cn('w-3.5 h-3.5 flex-shrink-0', config.color)} />
          <span className={cn('text-xs font-semibold', config.color)}>
            {config.label}
          </span>
          <StatusIcon status={data.status} />
        </div>
        {/* Label */}
        <p className="text-sm font-medium text-foreground leading-tight truncate">
          {data.label}
        </p>
        {/* Description */}
        {data.description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug truncate">
            {data.description}
          </p>
        )}
      </div>

      {hasSourceHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-muted-foreground/50 !border-border !w-2 !h-2"
        />
      )}
    </div>
  );
}

// ─── Specific node variants ───────────────────────────────────────────────────

export const TriggerNode = memo((props: NodeProps<NodeData>) => (
  <BaseNode {...props} hasTargetHandle={false} />
));
TriggerNode.displayName = 'TriggerNode';

export const HttpNode = memo((props: NodeProps<NodeData>) => <BaseNode {...props} />);
HttpNode.displayName = 'HttpNode';

export const TransformNode = memo((props: NodeProps<NodeData>) => <BaseNode {...props} />);
TransformNode.displayName = 'TransformNode';

export const ConditionNode = memo((props: NodeProps<NodeData>) => (
  <div
    className={cn(
      'relative min-w-[180px]',
      props.selected && 'ring-2 ring-primary ring-offset-1 ring-offset-background rounded-xl',
    )}
  >
    <BaseNode {...props} />
    {/* Extra source handle for the "false" branch */}
    <Handle
      id="false"
      type="source"
      position={Position.Right}
      className="!bg-red-400/60 !border-red-500/50 !w-2 !h-2"
      style={{ top: '50%' }}
    />
  </div>
));
ConditionNode.displayName = 'ConditionNode';

export const DelayNode = memo((props: NodeProps<NodeData>) => <BaseNode {...props} />);
DelayNode.displayName = 'DelayNode';

export const NotificationNode = memo((props: NodeProps<NodeData>) => <BaseNode {...props} />);
NotificationNode.displayName = 'NotificationNode';

// ─── Export map for ReactFlow nodeTypes prop ──────────────────────────────────

export const nodeTypes = {
  trigger: TriggerNode,
  http: HttpNode,
  transform: TransformNode,
  condition: ConditionNode,
  delay: DelayNode,
  notification: NotificationNode,
};
