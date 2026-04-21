import { clerkMiddleware, getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

export const clerkAuthMiddleware = clerkMiddleware();

export const requireAuth: RequestHandler = (req, res, next) => {
  const auth = getAuth(req);

  if (!auth.userId) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
      statusCode: 401,
    });
    return;
  }

  next();
};
