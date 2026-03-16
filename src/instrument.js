// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
const Sentry = require("@sentry/node");

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "https://0cfaab89ff758bf255f5bbece79afb96@o4510944413483008.ingest.us.sentry.io/4510961091215360",
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
  });
}
