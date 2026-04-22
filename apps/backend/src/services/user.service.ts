import { clerkClient } from "@clerk/express";
import { userRepository, workspaceRepository } from "../repositories";
import { AppError } from "../utils/AppError";
import type { IUser } from "../models";

export interface SyncUserInput {
  email?: string;
  name?: string;
  avatar?: string;
}

export interface UserProfile extends IUser {
  workspaceCount: number;
}

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string; id: string }>;
    primary_email_address_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
  };
};

const getClerkUserProfile = async (clerkId: string): Promise<SyncUserInput> => {
  const clerkUser = await clerkClient.users.getUser(clerkId);
  const email = clerkUser.primaryEmailAddress?.emailAddress;
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    clerkUser.username ||
    email;

  return {
    email,
    name,
    avatar: clerkUser.imageUrl,
  };
};

const getWebhookEmail = (event: ClerkWebhookEvent): string | undefined => {
  const primaryEmail = event.data.email_addresses?.find(
    (emailAddress) => emailAddress.id === event.data.primary_email_address_id,
  );

  return primaryEmail?.email_address ?? event.data.email_addresses?.[0]?.email_address;
};

export class UserService {
  async syncUser(clerkId: string, input: SyncUserInput = {}): Promise<IUser> {
    const clerkProfile = !input.email || !input.name ? await getClerkUserProfile(clerkId) : {};
    const email = input.email ?? clerkProfile.email;
    const name = input.name ?? clerkProfile.name;
    const avatar = input.avatar ?? clerkProfile.avatar;

    if (!email || !name) {
      throw new AppError("User email and name are required", 400);
    }

    return userRepository.upsertByClerkId(clerkId, {
      email,
      name,
      avatar,
    });
  }

  async handleClerkWebhook(event: ClerkWebhookEvent): Promise<IUser | null> {
    if (event.type === "user.deleted") {
      await userRepository.deleteByClerkId(event.data.id);
      return null;
    }

    if (event.type !== "user.created" && event.type !== "user.updated") {
      return null;
    }

    const name =
      [event.data.first_name, event.data.last_name].filter(Boolean).join(" ").trim() ||
      getWebhookEmail(event);

    return this.syncUser(event.data.id, {
      email: getWebhookEmail(event),
      name,
      avatar: event.data.image_url ?? undefined,
    });
  }

  async getUserProfile(clerkId: string): Promise<UserProfile> {
    const user = await userRepository.findByClerkId(clerkId);

    if (!user) {
      throw new AppError("User profile not found", 404);
    }

    const workspaceCount = await workspaceRepository.count({
      isDeleted: false,
      $or: [{ ownerId: clerkId }, { "members.userId": clerkId }],
    });

    return {
      ...user,
      workspaceCount,
    };
  }

  async updateProfile(clerkId: string, data: Pick<SyncUserInput, "name" | "avatar">): Promise<IUser> {
    const existingUser = await userRepository.findByClerkId(clerkId);

    if (!existingUser) {
      throw new AppError("User profile not found", 404);
    }

    const updatedUser = await userRepository.updateByClerkId(clerkId, {
      $set: data,
    });

    if (!updatedUser) {
      throw new AppError("User profile not found", 404);
    }

    return updatedUser;
  }
}

export const userService = new UserService();
