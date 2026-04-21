import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

type ErrorResponse = {
  success: false;
  error: string;
  statusCode: number;
  details?: unknown;
};

const isMongoServerError = (error: unknown): error is { code?: number; message: string } =>
  typeof error === "object" &&
  error !== null &&
  "name" in error &&
  (error as { name?: string }).name === "MongoServerError";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode = 500;
  let message = "Internal server error";
  let details: unknown;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation error";
    details = error.flatten();
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Database validation error";
    details = Object.values(error.errors).map((validationError) => validationError.message);
  } else if (isMongoServerError(error)) {
    statusCode = error.code === 11000 ? 409 : 500;
    message = error.code === 11000 ? "Duplicate database record" : "Database error";
  } else if (error instanceof Error) {
    message = error.message;
  }

  logger.error(message, {
    statusCode,
    stack: error instanceof Error ? error.stack : undefined,
    details,
  });

  const response: ErrorResponse = {
    success: false,
    error: message,
    statusCode,
  };

  if (details !== undefined) {
    response.details = details;
  }

  res.status(statusCode).json(response);
};
