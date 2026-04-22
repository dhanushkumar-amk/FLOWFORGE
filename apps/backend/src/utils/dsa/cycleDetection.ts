/**
 * DFS-based Cycle Detection for a Directed Graph
 *
 * Time Complexity:  O(V + E) — standard DFS
 * Space Complexity: O(V)     — visited + recursion stack sets
 *
 * Used in FlowForge to validate that a workflow graph has no cycles
 * before it is saved or executed.
 */

import type { DAGEdge, DAGNode } from './topologicalSort';

export interface CycleDetectionResult {
  hasCycle: boolean;
  cyclePath?: string[]; // node IDs forming the cycle (for user feedback)
}

/**
 * Detects cycles in a directed graph using DFS + recursion stack.
 *
 * @param nodes  - Array of node objects with .id
 * @param edges  - Directed edges { source, target }
 * @returns      - { hasCycle, cyclePath? }
 */
export function detectCycle(nodes: DAGNode[], edges: DAGEdge[]): CycleDetectionResult {
  // Build adjacency list
  const adjList = new Map<string, string[]>();
  for (const node of nodes) {
    adjList.set(node.id, []);
  }
  for (const edge of edges) {
    if (adjList.has(edge.source)) {
      adjList.get(edge.source)!.push(edge.target);
    }
  }

  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const parent = new Map<string, string>(); // to reconstruct cycle path

  /**
   * DFS helper — returns the node that closes the cycle, or null.
   */
  function dfs(nodeId: string): string | null {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    for (const neighbor of adjList.get(nodeId) ?? []) {
      if (!visited.has(neighbor)) {
        parent.set(neighbor, nodeId);
        const cycleNode = dfs(neighbor);
        if (cycleNode !== null) return cycleNode;
      } else if (recursionStack.has(neighbor)) {
        // Cycle found — neighbor is the entry point
        parent.set(neighbor, nodeId);
        return neighbor;
      }
    }

    recursionStack.delete(nodeId);
    return null;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      const cycleEntry = dfs(node.id);
      if (cycleEntry !== null) {
        // Reconstruct the cycle path
        const cyclePath: string[] = [cycleEntry];
        let current = parent.get(cycleEntry);

        while (current !== undefined && current !== cycleEntry) {
          cyclePath.unshift(current);
          current = parent.get(current);
        }
        cyclePath.unshift(cycleEntry); // close the loop

        return { hasCycle: true, cyclePath };
      }
    }
  }

  return { hasCycle: false };
}
