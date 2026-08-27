const config = require("../../config/config.js");

describe("Serverless Socket & Keepalive Configuration", () => {
  it("should configure production Sequelize pool without background evict timer and with disabled keepAlive", () => {
    const prodConfig = config.production;

    expect(prodConfig.pool).toBeDefined();
    expect(prodConfig.pool.min).toBe(0);
    expect(prodConfig.pool.idle).toBeLessThanOrEqual(5000);
    expect(prodConfig.pool.evict).toBeUndefined();

    expect(prodConfig.dialectOptions).toBeDefined();
    expect(prodConfig.dialectOptions.keepAlive).toBe(false);
  });

  it("should configure bounded reconnectStrategy for Redis in production", () => {
    const { getRedisOptions } = require("../../utils/redis.js");
    const options = getRedisOptions();

    expect(options.socket).toBeDefined();
    expect(options.socket.reconnectStrategy).toBeInstanceOf(Function);
    
    // Max retries (e.g. 3) returns an Error to halt infinite reconnection loop
    const errorResult = options.socket.reconnectStrategy(5);
    expect(errorResult).toBeInstanceOf(Error);
  });
});

