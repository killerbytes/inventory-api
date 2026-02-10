const { createClient } = require("redis");

let client;

const isMockEnv =
  process.env.NODE_ENV === "test" ||
  process.env.NODE_ENV === "staging" ||
  process.env.NODE_ENV === undefined;

if (isMockEnv) {
  client = {
    get: async () => null,
    setEx: async () => {},
    del: async () => {},
    publish: async () => {},
    subscribe: async () => {},
    quit: async () => {},
    scan: async () => ["0", []],
  };

  console.log("Redis skipped in test/staging environment");
} else {
  client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  client.on("error", (err) => console.error("Redis Client Error", err));

  client
    .connect()
    .then(() => console.log("Redis connected"))
    .catch((err) => console.error("Redis connection error", err));
}

const getCachedId = async (cacheKey) => {
  const cached = await client.get(cacheKey);
  if (!cached) return null;

  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
};

const deleteByPattern = async (pattern) => {
  let cursor = "0";
  const keysToDelete = new Set();

  do {
    const res = await client.scan(
      cursor,
      ...(client.scan.length === 2
        ? [{ MATCH: pattern, COUNT: 1000 }]
        : ["MATCH", pattern, "COUNT", 1000])
    );

    let nextCursor;
    let keys;

    if (res && typeof res === "object" && !Array.isArray(res)) {
      nextCursor = res.cursor;
      keys = res.keys;
    } else {
      nextCursor = res[0];
      keys = res[1];
    }

    cursor = String(nextCursor);

    if (Array.isArray(keys)) {
      for (const key of keys) {
        keysToDelete.add(key);
      }
    }
  } while (cursor !== "0");

  const allKeys = [...keysToDelete];

  for (let i = 0; i < allKeys.length; i += 500) {
    const chunk = allKeys.slice(i, i + 500);

    const pipeline = client.multi();
    chunk.forEach((key) => pipeline.unlink(key));
    await pipeline.exec();
  }
};

module.exports = {
  redis: client,
  getCachedId,
  deleteByPattern,
};
