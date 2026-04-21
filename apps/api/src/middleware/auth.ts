import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

export function attachCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  const auth = getAuth(req);

  if (!auth.isAuthenticated || !auth.userId) {
    res.status(401).json({
      error: "Unauthorized"
    });
    return;
  }

  req.currentUserId = auth.userId;
  next();
}

export function getCurrentUserId(req: Request): string | null {
  const auth = getAuth(req);
  return auth.userId ?? null;
}
