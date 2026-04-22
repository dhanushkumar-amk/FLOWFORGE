'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';
import { useBuilderStore, type NodeData, type NodeType } from '@/stores/builderStore';
import { nodeTypes } from './CustomNodes';
import type { Workflow } from '@/hooks/api/useWorkflows';

interface DagCanvasProps {
  workflow: Workflow;
  onSave: (dagJson: { nodes: Node<NodeData>[]; edges: Edge[] }) => Promise<void>;
}

export function DagCanvas({ workflow, onSave }: DagCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedNodeId,
    markDirty,
    loadFromDagJson,
  } = useBuilderStore();

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(nodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges);

  // Load initial DAG from workflow
  useEffect(() => {
    loadFromDagJson(workflow.dagJson as any);
    setRfNodes((workflow.dagJson?.nodes ?? []) as unknown as Node<NodeData>[]);
    setRfEdges((workflow.dagJson?.edges ?? []) as unknown as Edge[]);
  }, [workflow._id]);

  // Keep store in sync
  useEffect(() => {
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [rfNodes, rfEdges]);

  // ─── Auto-save with debounce ──────────────────────────────────────────────

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutoSave = useCallback(
    (nodes: Node<NodeData>[], edges: Edge[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          await onSave({ nodes, edges });
          useBuilderStore.getState().markSaved();
        } catch {
          toast.error('Auto-save failed');
        }
      }, 2000);
    },
    [onSave],
  );

  // ─── Connection handler ───────────────────────────────────────────────────

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = { ...connection, id: `edge-${nanoid(6)}` } as Edge;
      setRfEdges((eds) => addEdge(newEdge, eds));
      markDirty();
    },
    [setRfEdges, markDirty],
  );

  // ─── Drag & drop from toolbox ─────────────────────────────────────────────

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const nodeType = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!nodeType) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: Node<NodeData> = {
        id: `node-${nanoid(6)}`,
        type: nodeType,
        position,
        data: {
          label: `New ${nodeType}`,
          nodeType,
          config: {},
          status: 'idle',
        },
      };

      setRfNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(newNode.id);
      markDirty();
    },
    [reactFlowInstance, setRfNodes, setSelectedNodeId, markDirty],
  );

  // ─── Node click to select ─────────────────────────────────────────────────

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  // ─── Changes → auto-save ──────────────────────────────────────────────────

  const onNodesChangeWrapped = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      markDirty();
    },
    [onNodesChange, markDirty],
  );

  const onEdgesChangeWrapped = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      markDirty();
    },
    [onEdgesChange, markDirty],
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChangeWrapped}
        onEdgesChange={onEdgesChangeWrapped}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode="Delete"
        className="bg-[#0a0a0f]"
        defaultEdgeOptions={{
          animated: true,
          style: { strokeWidth: 2 },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255,255,255,0.05)"
        />
        <Controls className="[&>button]:bg-card [&>button]:border-border [&>button]:text-muted-foreground" />
        <MiniMap
          className="!bg-card !border !border-border rounded-lg"
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              trigger: '#8b5cf6',
              http: '#3b82f6',
              transform: '#f59e0b',
              condition: '#f97316',
              delay: '#06b6d4',
              notification: '#22c55e',
            };
            return colors[node.type ?? ''] ?? '#6b7280';
          }}
        />
      </ReactFlow>
    </div>
  );
}
