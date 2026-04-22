/**
 * Task Scheduler
 *
 * Wraps PriorityQueue to schedule FlowForge workflow tasks.
 * Uses priority + executeAt timestamp to determine next-ready task.
 */

import { PriorityQueue } from './priorityQueue';

export enum TaskPriority {
  HIGH = 1,
  MEDIUM = 5,
  LOW = 10,
}

export interface ScheduledTask {
  id: string;
  workflowId: string;
  nodeId: string;
  name: string;
  priority: TaskPriority;
  executeAt: Date; // earliest time this task can run
  payload?: Record<string, unknown>;
}

export class TaskScheduler {
  /**
   * Internal key: combined priority score = priority * 1e13 + executeAt(ms)
   * This ensures high-priority tasks run first, and among equal priorities,
   * earliest executeAt runs first.
   */
  private queue = new PriorityQueue<ScheduledTask>();

  scheduleTask(task: ScheduledTask): void {
    // Combined score: priority * large multiplier + milliseconds timestamp
    const score = task.priority * 1e13 + task.executeAt.getTime();
    this.queue.insert(task, score);
  }

  /**
   * Returns the next task that is ready to execute (executeAt <= now).
   * Returns null if no task is ready yet.
   */
  getNextTask(): ScheduledTask | null {
    if (this.queue.isEmpty()) return null;

    const top = this.queue.peek();
    if (top.executeAt.getTime() <= Date.now()) {
      return this.queue.extractMin();
    }

    return null; // next task isn't due yet
  }

  size(): number {
    return this.queue.size();
  }

  isEmpty(): boolean {
    return this.queue.isEmpty();
  }
}
