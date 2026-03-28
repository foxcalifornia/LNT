import app from "./app";
import { logger } from "./lib/logger";
import { initSumUpTokensFromDb } from "./lib/sumup";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Preload SumUp user tokens from DB so the first payment status check
  // after restart doesn't fail with 403 (env vars are empty until first request)
  initSumUpTokensFromDb().then(() => {
    logger.info("SumUp tokens preloaded from DB");
  }).catch(() => {
    logger.warn("SumUp tokens preload failed — will load lazily on first request");
  });
});
