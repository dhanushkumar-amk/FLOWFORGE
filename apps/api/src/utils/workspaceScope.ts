import type { FilterQuery, Types } from "mongoose";

export function withWorkspaceScope<T extends { workspaceId?: Types.ObjectId | string }>(
  workspaceId: string,
  query: FilterQuery<T> = {}
): FilterQuery<T> {
  return {
    ...query,
    workspaceId
  };
}
