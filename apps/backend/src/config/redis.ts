import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => {
  logger.info("Redis connection established");
});

redis.on("ready", () => {
  logger.info("Redis client ready");
});

redis.on("error", (error) => {
  logger.error("Redis connection error", {
    message: error.message,
  });
});

redis.on("close", () => {
  logger.warn("Redis connection closed");
});

export const connectRedis = async (): Promise<void> => {
  if (redis.status === "ready" || redis.status === "connecting" || redis.status === "connect") {
    return;
  }

  await redis.connect();
};

export const disconnectRedis = async (): Promise<void> => {
  if (redis.status === "end") {
    return;
  }

  await redis.quit();
  logger.info("Redis connection closed gracefully");
};
