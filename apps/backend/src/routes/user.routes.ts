import { Router } from "express";
import { getProfile, syncUser, updateProfile } from "../controllers/user.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/sync", requireAuth, syncUser);
router.get("/me", requireAuth, getProfile);
router.patch("/me", requireAuth, updateProfile);

export { router as userRoutes };
