import type { IWorkspace } from "../models";
import { cache } from "./cache";
import { CACHE_KEYS } from "./cacheKeys";

const getWorkspaceUserIds = (workspace: IWorkspace): string[] => {
  const userIds = new Set<string>([workspace.ownerId]);

  workspace.members.forEach((member) => {
    userIds.add(member.userId);
  });

  return Array.from(userIds);
};

export const invalidateUserCache = async (userId: string): Promise<void> => {
  await cache.del(CACHE_KEYS.user(userId));
};

export const invalidateUserWorkspaceCaches = async (userIds: string[]): Promise<void> => {
  await Promise.all(
    userIds.map(async (userId) => {
      await Promise.all([
        cache.del(CACHE_KEYS.user(userId)),
        cache.del(CACHE_KEYS.workspaceList(userId)),
      ]);
    }),
  );
};

export const invalidateWorkspaceCache = async (workspace: IWorkspace): Promise<void> => {
  const workspaceId = String("_id" in workspace ? workspace._id : "");

  await Promise.all([
    workspaceId ? cache.del(CACHE_KEYS.workspace(workspaceId)) : Promise.resolve(),
    workspaceId ? cache.del(CACHE_KEYS.workflowList(workspaceId)) : Promise.resolve(),
    workspaceId ? cache.del(CACHE_KEYS.executionStats(workspaceId)) : Promise.resolve(),
    invalidateUserWorkspaceCaches(getWorkspaceUserIds(workspace)),
  ]);
};

export const invalidateWorkflowCache = async (
  workflowId: string,
  workspaceId: string,
): Promise<void> => {
  await Promise.all([
    cache.del(CACHE_KEYS.workflow(workflowId)),
    cache.del(CACHE_KEYS.workflowList(workspaceId)),
    cache.del(CACHE_KEYS.executionStats(workspaceId)),
  ]);
};
