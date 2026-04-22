/**
 * Binary Heap Min-Priority Queue
 *
 * Time Complexity:
 *   insert:     O(log N) — bubble up
 *   extractMin: O(log N) — sink down
 *   peek:       O(1)     — root access
 *
 * Space Complexity: O(N)
 *
 * Used in FlowForge to schedule tasks by priority (HIGH → MEDIUM → LOW)
 * and handle timed retries (earliest retry timestamp first).
 */

interface HeapItem<T> {
  item: T;
  priority: number; // lower number = higher priority (min-heap)
  insertedAt: number; // timestamp — tiebreaker for equal priorities (FIFO)
}

export class PriorityQueue<T> {
  private heap: HeapItem<T>[] = [];

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Insert an item with a given priority.
   * Lower priority number = processed first.
   */
  insert(item: T, priority: number): void {
    const node: HeapItem<T> = { item, priority, insertedAt: Date.now() };
    this.heap.push(node);
    this.heapifyUp(this.heap.length - 1);
  }

  /**
   * Remove and return the item with the smallest priority number.
   * @throws if the queue is empty
   */
  extractMin(): T {
    if (this.isEmpty()) throw new Error('PriorityQueue is empty');

    const min = this.heap[0];
    const last = this.heap.pop()!;

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.heapifyDown(0);
    }

    return min.item;
  }

  /**
   * Return the minimum-priority item without removing it.
   */
  peek(): T {
    if (this.isEmpty()) throw new Error('PriorityQueue is empty');
    return this.heap[0].item;
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  // ─── Private Heap Helpers ─────────────────────────────────────────────────

  /** Bubble the node at `index` up until the heap property is restored */
  private heapifyUp(index: number): void {
    while (index > 0) {
      const p = this.parent(index);
      if (this.compare(index, p) < 0) {
        this.swap(index, p);
        index = p;
      } else {
        break;
      }
    }
  }

  /** Sink the node at `index` down until the heap property is restored */
  private heapifyDown(index: number): void {
    const size = this.heap.length;

    while (true) {
      let smallest = index;
      const left = this.leftChild(index);
      const right = this.rightChild(index);

      if (left < size && this.compare(left, smallest) < 0) smallest = left;
      if (right < size && this.compare(right, smallest) < 0) smallest = right;

      if (smallest !== index) {
        this.swap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
  }

  /**
   * Compare two heap items.
   * Returns negative if i has higher priority (lower number or earlier insert).
   */
  private compare(i: number, j: number): number {
    const a = this.heap[i];
    const b = this.heap[j];
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.insertedAt - b.insertedAt; // FIFO tiebreaker
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private leftChild(i: number): number {
    return 2 * i + 1;
  }

  private rightChild(i: number): number {
    return 2 * i + 2;
  }
}
