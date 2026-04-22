/**
 * DAG Service
 *
 * Business logic for workflow DAG operations:
 *  - Validation (cycle detection + topological sort)
 *  - Execution order
 *  - Parallel group identification
 *  - Critical path analysis
 */

import { detectCycle } from '../utils/dsa/cycleDetection';
import { topologicalSort } from '../utils/dsa/topologicalSort';
import { validateDAG } from '../utils/dsa/dagValidator';
import type { DAGEdge, DAGNode } from '../utils/dsa/topologicalSort';
import { AppError } from '../utils/AppError';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DagJson {
  nodes: Array<{ id: string; [key: string]: unknown }>;
  edges: Array<{ id: string; source: string; target: string; [key: string]: unknown }>;
}

export interface ExecutionPlan {
  order: string[];               // topological order
  parallelGroups: string[][];    // groups of nodes that can run in parallel
  criticalPath: string[];        // longest dependency path
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const dagService = {
  /**
   * Validate a raw dagJson object (called before saving a workflow).
   */
  validateDagJson(dagJson: DagJson) {
    const nodes: DAGNode[] = dagJson.nodes.map((n) => ({ id: n.id }));
    const edges: DAGEdge[] = dagJson.edges.map((e) => ({ source: e.source, target: e.target }));
    return validateDAG(nodes, edges);
  },

  /**
   * Get the full execution plan for a dagJson.
   * Throws AppError if the DAG is invalid.
   */
  getExecutionPlan(dagJson: DagJson): ExecutionPlan {
    const nodes: DAGNode[] = dagJson.nodes.map((n) => ({ id: n.id }));
    const edges: DAGEdge[] = dagJson.edges.map((e) => ({ source: e.source, target: e.target }));

    const validation = validateDAG(nodes, edges);
    if (!validation.valid) {
      throw new AppError(`Invalid DAG: ${validation.errors.join('; ')}`, 400);
    }

    const order = validation.executionOrder;
    const parallelGroups = identifyParallelGroups(nodes, edges, order);
    const criticalPath = calculateCriticalPath(nodes, edges, order);

    return { order, parallelGroups, criticalPath };
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Identify groups of nodes that can run in parallel.
 * Nodes at the same "depth" in the DAG (same longest distance from any root)
 * can run concurrently.
 *
 * Time: O(V + E)
 */
function identifyParallelGroups(
  nodes: DAGNode[],
  edges: DAGEdge[],
  order: string[],
): string[][] {
  // Build in-degree map and adjacency list
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjList.set(node.id, []);
  }
  for (const edge of edges) {
    adjList.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  // BFS level-by-level (like tree-level traversal)
  const groups: string[][] = [];
  const queue: string[] = [];
  const depth = new Map<string, number>();

  for (const [id, deg] of inDegree) {
    if (deg === 0) {
      queue.push(id);
      depth.set(id, 0);
    }
  }

  while (queue.length > 0) {
    const id = queue.shift()!;
    const d = depth.get(id) ?? 0;

    if (!groups[d]) groups[d] = [];
    groups[d].push(id);

    for (const neighbor of adjList.get(id) ?? []) {
      const newDegree = (inDegree.get(neighbor) ?? 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        depth.set(neighbor, d + 1);
        queue.push(neighbor);
      }
    }
  }

  return groups.filter((g) => g.length > 0);
}

/**
 * Calculate the critical path (longest path from any source to any sink).
 * Uses DP on the topological order.
 *
 * Time: O(V + E)
 */
function calculateCriticalPath(
  nodes: DAGNode[],
  edges: DAGEdge[],
  topoOrder: string[],
): string[] {
  if (nodes.length === 0) return [];

  const adjList = new Map<string, string[]>();
  for (const node of nodes) adjList.set(node.id, []);
  for (const edge of edges) adjList.get(edge.source)?.push(edge.target);

  // dist[id] = longest path ending at id (in hops)
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();

  for (const id of topoOrder) {
    dist.set(id, 0);
    prev.set(id, null);
  }

  for (const id of topoOrder) {
    const d = dist.get(id) ?? 0;
    for (const neighbor of adjList.get(id) ?? []) {
      if (d + 1 > (dist.get(neighbor) ?? 0)) {
        dist.set(neighbor, d + 1);
        prev.set(neighbor, id);
      }
    }
  }

  // Find the node with the maximum distance
  let maxDist = 0;
  let end = topoOrder[0];
  for (const [id, d] of dist) {
    if (d > maxDist) {
      maxDist = d;
      end = id;
    }
  }

  // Reconstruct path by following prev pointers
  const path: string[] = [];
  let current: string | null = end;
  while (current !== null) {
    path.unshift(current);
    current = prev.get(current) ?? null;
  }

  return path;
}
