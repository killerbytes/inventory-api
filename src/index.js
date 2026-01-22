const app = require("./app");
const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");

app.use(errorHandler);

app.listen(process.env.PORT || 8080, () => {
  logger.info(`Server started on port ${process.env.PORT || 8080}`);
});
