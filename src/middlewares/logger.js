const pino = require("pino");
const env = process.env.NODE_ENV || "development";

const logger = pino({
  level: process.env.LOG_LEVEL || "error",
  timestamp: pino.stdTimeFunctions.isoTime, // [2025-09-07T10:34:11.531Z]
  formatters: {
    level: (label) => ({ level: label }),
  },
  transport:
    env === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

module.exports = logger;
