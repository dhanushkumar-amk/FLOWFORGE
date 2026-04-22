import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import type { Server } from "node:http";
import { connectDB, disconnectDB } from "./config/database";
import { env } from "./config/env";
import { connectRedis, disconnectRedis } from "./config/redis";
import { clerkAuthMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { userRoutes, workspaceRoutes, dagRoutes } from "./routes";
import { workflowRoutes } from "./routes/workflow.routes";
import { globalRateLimiter } from "./middleware/rateLimiter";
import { logger } from "./utils/logger";
import { initSocketServer } from "./socket";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  }),
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(clerkAuthMiddleware);
app.use(globalRateLimiter);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/users", userRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/workflows", workflowRoutes);
// Legacy DAG utility routes (validate/execution-plan via dagRoutes already merged into workflowRoutes)

app.use(notFound);
app.use(errorHandler);

const startServer = async (): Promise<Server> => {
  await connectDB();
  await connectRedis();

  const server = app.listen(env.PORT, () => {
    logger.info("Backend server started", {
      port: env.PORT,
      environment: env.NODE_ENV,
    });
  });

  // Attach Socket.io to the same HTTP server
  initSocketServer(server);

  return server;
};

const shutdown = async (server?: Server): Promise<void> => {
  logger.info("Graceful shutdown started");

  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  await Promise.all([disconnectDB(), disconnectRedis()]);
  logger.info("Graceful shutdown completed");
};

if (require.main === module) {
  let server: Server | undefined;

  startServer()
    .then((startedServer) => {
      server = startedServer;
    })
    .catch((error) => {
      logger.error("Failed to start backend server", {
        message: error instanceof Error ? error.message : String(error),
      });
      process.exit(1);
    });

  process.on("SIGTERM", () => {
    shutdown(server)
      .then(() => process.exit(0))
      .catch((error) => {
        logger.error("Graceful shutdown failed", {
          message: error instanceof Error ? error.message : String(error),
        });
        process.exit(1);
      });
  });

  process.on("SIGINT", () => {
    shutdown(server)
      .then(() => process.exit(0))
      .catch((error) => {
        logger.error("Graceful shutdown failed", {
          message: error instanceof Error ? error.message : String(error),
        });
        process.exit(1);
      });
  });
}

export { app, startServer, shutdown };
