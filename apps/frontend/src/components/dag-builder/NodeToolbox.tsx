'use client';

import { useMemo } from 'react';
import type { NodeType } from '@/stores/builderStore';
import { NODE_TYPE_CONFIG } from './CustomNodes';
import {
  Activity,
  Bell,
  Clock,
  GitBranch,
  Globe,
  Shuffle,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NODE_ICONS: Record<NodeType, React.FC<{ className?: string }>> = {
  trigger: Zap,
  http: Globe,
  transform: Shuffle,
  condition: GitBranch,
  delay: Clock,
  notification: Bell,
};

const NODE_TYPES: NodeType[] = ['trigger', 'http', 'transform', 'condition', 'delay', 'notification'];

export function NodeToolbox() {
  function onDragStart(event: React.DragEvent, nodeType: NodeType) {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div className="flex flex-col bg-card border-r border-border w-52 h-full">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Node Palette
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {NODE_TYPES.map((type) => {
          const cfg = NODE_TYPE_CONFIG[type];
          const Icon = NODE_ICONS[type];
          return (
            <div
              key={type}
              draggable
              onDragStart={(e) => onDragStart(e, type)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing',
                'border transition-all duration-150 select-none',
                cfg.bg,
                cfg.border,
                'hover:scale-[1.02] hover:shadow-sm',
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', cfg.color)} />
              <div>
                <p className={cn('text-xs font-semibold', cfg.color)}>{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-4 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Drag nodes onto the canvas
        </p>
      </div>
    </div>
  );
}
