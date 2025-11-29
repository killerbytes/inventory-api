const app = require("./app");
const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");
const http = require("http");

// Attach error handler middleware
app.use(errorHandler);

// Create HTTP server instead of using app.listen()
const server = http.createServer(app);

// Optimize idle memory usage + connection cleanup
server.keepAliveTimeout = 30000; // Close idle keep-alive connections at 30s
server.headersTimeout = 35000; // Must be slightly higher than keepAliveTimeout
server.requestTimeout = 10000; // Drop slow/stuck requests sooner

server.listen(3000, () => {
  logger.info("Server started on port 3000 (optimized timeouts enabled)");
});
