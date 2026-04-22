import type { ZodError, ZodIssue } from "zod";

export interface FormattedZodError {
  path: string;
  message: string;
  code: ZodIssue["code"];
}

export const formatZodErrors = (error: ZodError): FormattedZodError[] =>
  error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "body",
    message: issue.message,
    code: issue.code,
  }));
