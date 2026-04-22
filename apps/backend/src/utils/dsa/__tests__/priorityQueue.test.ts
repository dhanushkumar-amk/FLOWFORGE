import { PriorityQueue } from '../priorityQueue';

describe('PriorityQueue', () => {
  test('extracts items in ascending priority order', () => {
    const pq = new PriorityQueue<string>();
    pq.insert('low', 10);
    pq.insert('high', 1);
    pq.insert('medium', 5);

    expect(pq.extractMin()).toBe('high');
    expect(pq.extractMin()).toBe('medium');
    expect(pq.extractMin()).toBe('low');
  });

  test('FIFO tiebreaker for equal priorities', () => {
    jest.useFakeTimers();

    const pq = new PriorityQueue<string>();
    pq.insert('first', 5);
    jest.setSystemTime(Date.now() + 1);
    pq.insert('second', 5);
    jest.setSystemTime(Date.now() + 1);
    pq.insert('third', 5);

    expect(pq.extractMin()).toBe('first');
    expect(pq.extractMin()).toBe('second');
    expect(pq.extractMin()).toBe('third');

    jest.useRealTimers();
  });


  test('peek returns min without removing', () => {
    const pq = new PriorityQueue<number>();
    pq.insert(42, 2);
    pq.insert(99, 1);
    expect(pq.peek()).toBe(99);
    expect(pq.size()).toBe(2);
  });

  test('size and isEmpty work correctly', () => {
    const pq = new PriorityQueue<string>();
    expect(pq.isEmpty()).toBe(true);
    expect(pq.size()).toBe(0);

    pq.insert('a', 1);
    expect(pq.isEmpty()).toBe(false);
    expect(pq.size()).toBe(1);

    pq.extractMin();
    expect(pq.isEmpty()).toBe(true);
  });

  test('throws on extractMin from empty queue', () => {
    const pq = new PriorityQueue<string>();
    expect(() => pq.extractMin()).toThrow('PriorityQueue is empty');
  });

  test('throws on peek from empty queue', () => {
    const pq = new PriorityQueue<string>();
    expect(() => pq.peek()).toThrow('PriorityQueue is empty');
  });

  test('handles 100 items in random order — extracts in sorted order', () => {
    const pq = new PriorityQueue<number>();
    const input = Array.from({ length: 100 }, (_, i) => i).sort(() => Math.random() - 0.5);

    for (const n of input) pq.insert(n, n);

    const output: number[] = [];
    while (!pq.isEmpty()) output.push(pq.extractMin() as number);

    const sorted = [...input].sort((a, b) => a - b);
    expect(output).toEqual(sorted);
  });
});
