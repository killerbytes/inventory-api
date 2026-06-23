const express = require("express");
const pinoHttp = require("pino-http");
const cors = require("cors");
const dotenv = require("dotenv");
const { randomUUID } = require("crypto");
const { spawn } = require("child_process");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");
const jwt = require("jsonwebtoken");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const env = process.env.NODE_ENV || "development";
const envPath = `.env.${env}`;
const logger = require("./middlewares/logger");
const ApiError = require("./services/ApiError");

dotenv.config({ path: envPath });

const app = express();
app.use(compression());

app.use(
  cors({
    origin: env === "development" ? true : [process.env.CLIENT_URL],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      return req.headers["x-request-id"] || randomUUID();
    },
  }),
);

app.get("/api", (req, res) => {
  const { BUILD_TIME } = require("../dist/build-info");
  res.json({
    env: env,
    buildTime: BUILD_TIME,
  });
});
app.get("/", (req, res) => {
  res.json({ env: env });
});

async function startServer() {
  try {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    await server.start();

    app.use(
      "/graphql",
      expressMiddleware(server, {
        context: async ({ req, res }) => {
          let user = null;
          const authHeader = req.headers.authorization;

          if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7, authHeader.length);
            try {
              const decoded = jwt.verify(token, process.env.JWT_SECRET);

              user = {
                id: decoded.id,
                role: decoded.role,
                permissions: decoded.permissions,
              };
            } catch (err) {
              logger.error("Token verification failed", err.message);
            }
          }
          return { req, res, user };
        },
      }),
    );

    app.use((req, res, next) => {
      next(
        ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`),
      );
    });

    return app;
  } catch (error) {
    logger.error(error, "Error starting Apollo Server:");
    process.exit(1);
  }
}

module.exports = { app, startServer };
