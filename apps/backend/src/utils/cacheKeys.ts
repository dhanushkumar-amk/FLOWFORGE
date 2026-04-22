export const CACHE_KEYS = {
  user: (id: string) => `user:${id}`,
  workspace: (id: string) => `workspace:${id}`,
  workspaceList: (userId: string) => `workspaces:user:${userId}`,
  workflow: (id: string) => `workflow:${id}`,
  workflowList: (workspaceId: string) => `workflows:ws:${workspaceId}`,
  executionStats: (workspaceId: string) => `stats:ws:${workspaceId}`,
  route: (path: string) => `route:${path}`,
} as const;

export const CACHE_TTL_SECONDS = {
  workspaceList: 5 * 60,
  workspace: 10 * 60,
  userProfile: 15 * 60,
  route: 60,
} as const;
