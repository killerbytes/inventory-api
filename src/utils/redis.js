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
    scan: async () => ["0", []], // ✅ important
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

/* ================= HELPERS ================= */

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

  do {
    const res = await client.scan(
      cursor,
      // legacy clients ignore the object form, v4 ignores the string form
      ...(typeof client.scan === "function" && client.scan.length === 2
        ? [{ MATCH: pattern, COUNT: 100 }]
        : ["MATCH", pattern, "COUNT", 100])
    );

    let nextCursor;
    let keys;

    // node-redis v4 → { cursor, keys }
    if (res && typeof res === "object" && !Array.isArray(res)) {
      ({ cursor: nextCursor, keys } = res);
    }
    // legacy / ioredis → [cursor, keys]
    else {
      [nextCursor, keys] = res;
    }

    cursor = nextCursor;

    if (keys?.length) {
      await client.unlink(...keys); // non-blocking, safe for prod
    }
  } while (cursor !== "0");
};

/* ================= EXPORT ================= */

module.exports = {
  redis: client,
  getCachedId,
  deleteByPattern,
};
