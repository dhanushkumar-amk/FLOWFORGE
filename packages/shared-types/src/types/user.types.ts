export enum UserRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER",
}

export interface IUser {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWorkspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  members: IWorkspaceMember[];
  createdAt: string;
  updatedAt: string;
}

export interface IWorkspaceMember {
  userId: string;
  role: UserRole;
  joinedAt: string;
}
