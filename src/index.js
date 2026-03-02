require("./instrument.js");

// All other imports below
// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
const Sentry = require("@sentry/node");
const app = require("./app");
const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");

Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

app.listen(process.env.PORT || 8080, () => {
  logger.info(`Server started on port ${process.env.PORT || 8080}`);
});
