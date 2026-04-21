type LogLevel = "info" | "warn" | "error" | "debug";

type LogMetadata = Record<string, unknown>;

const writeLog = (level: LogLevel, message: string, metadata?: LogMetadata): void => {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(metadata ? { metadata } : {}),
  };

  const serializedPayload = JSON.stringify(payload);

  if (level === "error") {
    console.error(serializedPayload);
    return;
  }

  if (level === "warn") {
    console.warn(serializedPayload);
    return;
  }

  console.log(serializedPayload);
};

export const logger = {
  info: (message: string, metadata?: LogMetadata) => writeLog("info", message, metadata),
  warn: (message: string, metadata?: LogMetadata) => writeLog("warn", message, metadata),
  error: (message: string, metadata?: LogMetadata) => writeLog("error", message, metadata),
  debug: (message: string, metadata?: LogMetadata) => writeLog("debug", message, metadata),
};
