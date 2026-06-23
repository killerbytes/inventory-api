require("./instrument.js");

const Sentry = require("@sentry/node");
const { app, startServer } = require("./app");
const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");

async function init() {
  console.log("Initializing server...");
  await startServer();
  console.log("Apollo Server started.");

  if (process.env.NODE_ENV === "production") {
    Sentry.setupExpressErrorHandler(app);
  }
  app.use(errorHandler);

  app.listen(process.env.PORT || 8080, () => {
    console.log(`Server started on port ${process.env.PORT || 8080}`);
    logger.info(`Server started on port ${process.env.PORT || 8080}`);
  });
}

init().catch(err => {
  console.error("Failed to initialize app:", err);
  logger.error("Failed to initialize app:", err);
  process.exit(1);
});
