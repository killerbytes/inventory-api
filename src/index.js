const app = require("./app");
const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");

app.use(errorHandler);

app.listen(3000, () => {
  logger.info("Server started on port 3000");
});
