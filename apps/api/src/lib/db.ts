import mongoose from "mongoose";

const DEFAULT_URI = "mongodb://localhost:27017/flowforge";

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectionPromise) {
    const mongoUri = process.env.MONGODB_URI ?? process.env.MONGO_URL ?? DEFAULT_URI;

    connectionPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
  }

  try {
    return await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  connectionPromise = null;
}
