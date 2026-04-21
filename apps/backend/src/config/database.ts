import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5_000;

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

mongoose.connection.on("connected", () => {
  logger.info("MongoDB connection established");
});

mongoose.connection.on("error", (error) => {
  logger.error("MongoDB connection error", {
    message: error instanceof Error ? error.message : String(error),
  });
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB connection disconnected");
});

export const connectDB = async (attempt = 1): Promise<typeof mongoose> => {
  try {
    return await mongoose.connect(env.MONGODB_URI);
  } catch (error) {
    logger.error("MongoDB connection attempt failed", {
      attempt,
      maxRetries: MAX_RETRIES,
      message: error instanceof Error ? error.message : String(error),
    });

    if (attempt >= MAX_RETRIES) {
      throw error;
    }

    await wait(RETRY_DELAY_MS);
    return connectDB(attempt + 1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.connection.close();
  logger.info("MongoDB connection closed");
};
