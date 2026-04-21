import express from "express";

import { createAppBanner } from "@flowforge/shared";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";
const banner = createAppBanner("api");

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "api",
    banner,
    mongoUrl: process.env.MONGO_URL ?? null,
    redisUrl: process.env.REDIS_URL ?? null
  });
});

app.listen(port, host, () => {
  console.log(`${banner} listening on http://${host}:${port}`);
});
