import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { logger } from "./utils/logger";

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

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(env.PORT, () => {
    logger.info("Backend server started", {
      port: env.PORT,
      environment: env.NODE_ENV,
    });
  });
}

export { app };
