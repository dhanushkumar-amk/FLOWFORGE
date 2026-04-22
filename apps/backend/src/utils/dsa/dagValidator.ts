/**
 * DAG Validator
 *
 * Combines cycle detection + topological sort into a single validation step.
 * Called before saving or executing any workflow.
 */

import { detectCycle } from './cycleDetection';
import { CycleError, topologicalSort } from './topologicalSort';
import type { DAGEdge, DAGNode } from './topologicalSort';

export interface DAGValidationResult {
  valid: boolean;
  executionOrder: string[]; // topologically sorted node IDs
  errors: string[];
}

/**
 * Validates a DAG:
 *  1. Checks for cycles (DFS)
 *  2. Runs topological sort (Kahn's)
 *
 * @param nodes - Workflow nodes
 * @param edges - Directed edges
 */
export function validateDAG(nodes: DAGNode[], edges: DAGEdge[]): DAGValidationResult {
  const errors: string[] = [];

  // Edge case: empty workflow
  if (nodes.length === 0) {
    return {
      valid: false,
      executionOrder: [],
      errors: ['Workflow must have at least one node'],
    };
  }

  // Step 1: Cycle detection
  const { hasCycle, cyclePath } = detectCycle(nodes, edges);
  if (hasCycle) {
    const pathStr = cyclePath ? cyclePath.join(' → ') : 'unknown';
    errors.push(`Cycle detected: ${pathStr}`);
    return { valid: false, executionOrder: [], errors };
  }

  // Step 2: Topological sort (should never throw now, but guard anyway)
  try {
    const executionOrder = topologicalSort(nodes, edges);
    return { valid: true, executionOrder, errors: [] };
  } catch (err) {
    if (err instanceof CycleError) {
      errors.push(err.message);
    } else {
      errors.push('Unknown validation error');
    }
    return { valid: false, executionOrder: [], errors };
  }
}
