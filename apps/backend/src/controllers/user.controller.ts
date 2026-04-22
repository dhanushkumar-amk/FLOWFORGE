import { getAuth } from "@clerk/express";
import type { RequestHandler } from "express";
import { userService } from "../services/user.service";
import { AppError } from "../utils/AppError";

const getUserId = (req: Parameters<RequestHandler>[0]): string => {
  const { userId } = getAuth(req);

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  return userId;
};

const getBody = (req: Parameters<RequestHandler>[0]): Record<string, unknown> =>
  typeof req.body === "object" && req.body !== null ? (req.body as Record<string, unknown>) : {};

const getOptionalString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

export const syncUser: RequestHandler = async (req, res, next) => {
  try {
    const body = getBody(req);
    const user = await userService.syncUser(getUserId(req), {
      email: getOptionalString(body.email),
      name: getOptionalString(body.name),
      avatar: getOptionalString(body.avatar),
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile: RequestHandler = async (req, res, next) => {
  try {
    const profile = await userService.getUserProfile(getUserId(req));

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    const body = getBody(req);
    const user = await userService.updateProfile(getUserId(req), {
      name: getOptionalString(body.name),
      avatar: getOptionalString(body.avatar),
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
