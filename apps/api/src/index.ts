import "dotenv/config";

import { clerkMiddleware, requireAuth } from "@clerk/express";
import express from "express";

import { createAppBanner } from "@flowforge/shared";
import { connectDatabase } from "./lib/db";
import { attachCurrentUser } from "./middleware/auth";
import { authRouter } from "./routes/auth.routes";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";
const banner = createAppBanner("api");

app.use(clerkMiddleware());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "api",
    banner,
    mongoUrl: process.env.MONGODB_URI ?? process.env.MONGO_URL ?? null,
    redisUrl: process.env.REDIS_URL ?? null
  });
});

app.use("/api", requireAuth(), attachCurrentUser);
app.use("/api/auth", authRouter);

async function startServer(): Promise<void> {
  await connectDatabase();

  app.listen(port, host, () => {
    console.log(`${banner} listening on http://${host}:${port}`);
  });
}

void startServer().catch((error: unknown) => {
  console.error(`${banner} failed to start`, error);
  process.exit(1);
});
