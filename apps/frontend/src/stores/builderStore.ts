'use client';

import { create } from 'zustand';
import type { Node, Edge } from 'reactflow';

export type NodeType = 'trigger' | 'http' | 'transform' | 'condition' | 'delay' | 'notification';

export interface NodeData {
  label: string;
  nodeType: NodeType;
  config: Record<string, unknown>;
  status?: 'idle' | 'running' | 'success' | 'error';
  description?: string;
}

interface BuilderState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  isDirty: boolean;
  lastSaved: Date | null;
  // Actions
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  markDirty: () => void;
  markSaved: () => void;
  loadFromDagJson: (dagJson: { nodes: Node<NodeData>[]; edges: Edge[] }) => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDirty: false,
  lastSaved: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
      ),
      isDirty: true,
    })),

  markDirty: () => set({ isDirty: true }),
  markSaved: () => set({ isDirty: false, lastSaved: new Date() }),

  loadFromDagJson: (dagJson) =>
    set({
      nodes: dagJson.nodes ?? [],
      edges: dagJson.edges ?? [],
      isDirty: false,
      selectedNodeId: null,
    }),
}));
