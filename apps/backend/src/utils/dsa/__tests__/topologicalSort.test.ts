import { CycleError, topologicalSort } from '../topologicalSort';
import type { DAGEdge, DAGNode } from '../topologicalSort';
import { validateDAG } from '../dagValidator';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeNodes(ids: string[]): DAGNode[] {
  return ids.map((id) => ({ id }));
}

function makeEdges(pairs: [string, string][]): DAGEdge[] {
  return pairs.map(([source, target]) => ({ source, target }));
}

// ─── topologicalSort ────────────────────────────────────────────────────────

describe('topologicalSort', () => {
  test('linear DAG: A → B → C → D', () => {
    const nodes = makeNodes(['A', 'B', 'C', 'D']);
    const edges = makeEdges([['A', 'B'], ['B', 'C'], ['C', 'D']]);
    const order = topologicalSort(nodes, edges);
    // A must come before B, B before C, C before D
    expect(order.indexOf('A')).toBeLessThan(order.indexOf('B'));
    expect(order.indexOf('B')).toBeLessThan(order.indexOf('C'));
    expect(order.indexOf('C')).toBeLessThan(order.indexOf('D'));
  });

  test('branching DAG: A → B, A → C, B → D, C → D', () => {
    const nodes = makeNodes(['A', 'B', 'C', 'D']);
    const edges = makeEdges([['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D']]);
    const order = topologicalSort(nodes, edges);
    expect(order.indexOf('A')).toBeLessThan(order.indexOf('B'));
    expect(order.indexOf('A')).toBeLessThan(order.indexOf('C'));
    expect(order.indexOf('B')).toBeLessThan(order.indexOf('D'));
    expect(order.indexOf('C')).toBeLessThan(order.indexOf('D'));
  });

  test('parallel DAG: A → C, B → C', () => {
    const nodes = makeNodes(['A', 'B', 'C']);
    const edges = makeEdges([['A', 'C'], ['B', 'C']]);
    const order = topologicalSort(nodes, edges);
    expect(order.indexOf('A')).toBeLessThan(order.indexOf('C'));
    expect(order.indexOf('B')).toBeLessThan(order.indexOf('C'));
  });

  test('disconnected graph: A → B, C (isolated)', () => {
    const nodes = makeNodes(['A', 'B', 'C']);
    const edges = makeEdges([['A', 'B']]);
    const order = topologicalSort(nodes, edges);
    expect(order).toHaveLength(3);
    expect(order).toContain('C');
  });

  test('single node, no edges', () => {
    const nodes = makeNodes(['A']);
    const order = topologicalSort(nodes, []);
    expect(order).toEqual(['A']);
  });

  test('throws CycleError for A → B → C → A', () => {
    const nodes = makeNodes(['A', 'B', 'C']);
    const edges = makeEdges([['A', 'B'], ['B', 'C'], ['C', 'A']]);
    expect(() => topologicalSort(nodes, edges)).toThrow(CycleError);
  });

  test('throws CycleError for self-loop: A → A', () => {
    const nodes = makeNodes(['A']);
    const edges = makeEdges([['A', 'A']]);
    expect(() => topologicalSort(nodes, edges)).toThrow(CycleError);
  });
});

// ─── validateDAG ────────────────────────────────────────────────────────────

describe('validateDAG', () => {
  test('valid DAG returns valid=true and executionOrder', () => {
    const nodes = makeNodes(['A', 'B', 'C']);
    const edges = makeEdges([['A', 'B'], ['B', 'C']]);
    const result = validateDAG(nodes, edges);
    expect(result.valid).toBe(true);
    expect(result.executionOrder).toHaveLength(3);
    expect(result.errors).toHaveLength(0);
  });

  test('cyclic workflow returns valid=false with error message', () => {
    const nodes = makeNodes(['A', 'B', 'C']);
    const edges = makeEdges([['A', 'B'], ['B', 'C'], ['C', 'A']]);
    const result = validateDAG(nodes, edges);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/cycle/i);
  });

  test('empty workflow returns valid=false', () => {
    const result = validateDAG([], []);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/at least one node/i);
  });
});
