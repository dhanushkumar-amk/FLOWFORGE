import { getAuth } from "@clerk/express";
import { Router } from "express";

const authRouter = Router();

authRouter.get("/me", (req, res) => {
  const auth = getAuth(req);

  res.json({
    userId: auth.userId,
    sessionId: auth.sessionId,
    orgId: auth.orgId ?? null,
    actor: auth.actor ?? null,
    isAuthenticated: auth.isAuthenticated
  });
});

export { authRouter };
