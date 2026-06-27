const logger = require('../../utils/logger');

describe('Structured Logger (Pino)', () => {
  it('should export standard logging methods', () => {
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('should have a base configuration', () => {
    expect(logger.level).toBeDefined();
  });
});
