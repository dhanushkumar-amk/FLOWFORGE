import dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";

dotenv.config({
  path: [
    path.resolve(process.cwd(), "apps/backend/.env"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), ".env.local"),
  ],
});

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((origins) =>
      origins
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
  CLERK_PUBLISHABLE_KEY: z.string().min(1, "CLERK_PUBLISHABLE_KEY is required"),
  CLOUDFLARE_R2_BUCKET: z.string().min(1, "CLOUDFLARE_R2_BUCKET is required"),
  CLOUDFLARE_R2_ACCESS_KEY: z.string().min(1, "CLOUDFLARE_R2_ACCESS_KEY is required"),
  CLOUDFLARE_R2_SECRET_KEY: z.string().min(1, "CLOUDFLARE_R2_SECRET_KEY is required"),
  INNGEST_EVENT_KEY: z.string().min(1, "INNGEST_EVENT_KEY is required"),
  INNGEST_SIGNING_KEY: z.string().min(1, "INNGEST_SIGNING_KEY is required"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  RAZORPAY_KEY_ID: z.string().min(1, "RAZORPAY_KEY_ID is required"),
  RAZORPAY_KEY_SECRET: z.string().min(1, "RAZORPAY_KEY_SECRET is required"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const missingVariables = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");

  throw new Error(`Invalid environment configuration: ${missingVariables}`);
}

export const env = parsedEnv.data;
