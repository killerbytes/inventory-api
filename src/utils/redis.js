const { createClient } = require("redis");

let client;

if (
  process.env.NODE_ENV === "test" ||
  process.env.NODE_ENV === undefined ||
  process.env.NODE_ENV === "staging"
) {
  client = {
    get: async () => null,
    setEx: async () => {},
    del: async () => {},
    publish: async () => {},
    subscribe: async () => {},
    quit: async () => {},
  };
  console.log("Redis skipped in test environment");
} else {
  client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6500",
  });

  client.on("error", (err) => console.error("Redis Client Error", err));

  client
    .connect()
    .then(() => console.log("Redis connected"))
    .catch((err) => console.error("Redis connection error", err));
}

const getCachedId = async (cacheKey) => {
  const cached = await client.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
};

module.exports = client;
module.exports.getCachedId = getCachedId;
