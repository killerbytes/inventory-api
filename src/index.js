require("./instrument.js");

// All other imports below
// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
const Sentry = require("@sentry/node");
const app = require("./app");
const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");
const https = require("https");
const fs = require("fs");
const path = require("path");

if (process.env.NODE_ENV === "production") {
  Sentry.setupExpressErrorHandler(app);
}
app.use(errorHandler);

if (process.env.NODE_ENV === "development") {
  const options = {
    key: fs.readFileSync(path.join(__dirname, "../server.key")),
    cert: fs.readFileSync(path.join(__dirname, "../server.cert"))
  };

  https.createServer(options, app).listen(process.env.PORT || 8080, () => {
    logger.info(`HTTPS Server started on port ${process.env.PORT || 8080}`);
  });
} else {
  app.listen(process.env.PORT || 8080, () => {
    logger.info(`Server started on port ${process.env.PORT || 8080}`);
  });
}
