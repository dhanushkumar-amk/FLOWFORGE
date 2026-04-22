import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";
import { formatZodErrors } from "../utils/formatZodErrors";

export const validate =
  (schema: ZodSchema): RequestHandler =>
  (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(422).json({
          success: false,
          error: "Validation failed",
          statusCode: 422,
          details: formatZodErrors(error),
        });
        return;
      }

      next(error);
    }
  };
