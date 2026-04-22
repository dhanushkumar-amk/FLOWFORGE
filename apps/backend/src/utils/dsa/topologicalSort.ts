/**
 * Kahn's Topological Sort Algorithm
 *
 * Time Complexity:  O(V + E) — visits every vertex and edge once
 * Space Complexity: O(V + E) — adjacency list + in-degree map + queue
 *
 * Used in FlowForge to determine the correct execution order of workflow tasks.
 */

export interface DAGNode {
  id: string;
}

export interface DAGEdge {
  source: string;
  target: string;
}

export class CycleError extends Error {
  constructor(message = 'Cycle detected in DAG — workflow is not a valid DAG') {
    super(message);
    this.name = 'CycleError';
  }
}

/**
 * Performs Kahn's topological sort on a DAG.
 *
 * @param nodes  - Array of node objects (must have .id)
 * @param edges  - Array of directed edges { source, target }
 * @returns      - Array of node IDs in topological order
 * @throws       - CycleError if the graph contains a cycle
 */
export function topologicalSort(nodes: DAGNode[], edges: DAGEdge[]): string[] {
  const nodeIds = nodes.map((n) => n.id);

  // Step 1: Build adjacency list and in-degree map
  const adjList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const id of nodeIds) {
    adjList.set(id, []);
    inDegree.set(id, 0);
  }

  for (const edge of edges) {
    const { source, target } = edge;

    // Guard: skip edges pointing to unknown nodes
    if (!adjList.has(source) || !adjList.has(target)) continue;

    adjList.get(source)!.push(target);
    inDegree.set(target, (inDegree.get(target) ?? 0) + 1);
  }

  // Step 2: Initialize queue with all zero-in-degree nodes
  const queue: string[] = [];
  for (const [id, degree] of inDegree.entries()) {
    if (degree === 0) queue.push(id);
  }

  // Step 3: BFS-style processing
  const result: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!; // dequeue
    result.push(current);

    for (const neighbor of adjList.get(current) ?? []) {
      const newDegree = (inDegree.get(neighbor) ?? 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  // Step 4: If result doesn't include all nodes → cycle exists
  if (result.length !== nodeIds.length) {
    throw new CycleError();
  }

  return result;
}
