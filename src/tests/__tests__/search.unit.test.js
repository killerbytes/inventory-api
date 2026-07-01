
const productCombinationService = require("../../services/productCombination.service");
const db = require("../../models");

jest.mock("../../models", () => ({
  sequelize: {
    query: jest.fn().mockResolvedValue([]),
    QueryTypes: { SELECT: "SELECT" }
  },
  ProductCombination: {},
  Product: {},
  VariantType: {},
  VariantValue: {},
  Inventory: {},
  CombinationValue: {},
  StockAdjustment: {}
}));

describe("productCombinationService.search Unit Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate a clean tsQuery even with special characters", async () => {
    const searchString = "channel bar - 2x4 | hd";
    await productCombinationService.search({ search: searchString });

    expect(db.sequelize.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        replacements: expect.objectContaining({
          tsQuery: "channel:* & bar:* & 2x4:* & hd:*"
        })
      })
    );
  });

  it("should handle mixed special characters and operators", async () => {
    const searchString = "product! name (test) | or & and";
    await productCombinationService.search({ search: searchString });

    expect(db.sequelize.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        replacements: expect.objectContaining({
          tsQuery: "product:* & name:* & test:* & or:* & and:*"
        })
      })
    );
  });

  it("should handle non-string search input gracefully", async () => {
    await productCombinationService.search({ search: null });

    expect(db.sequelize.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        replacements: expect.objectContaining({
          tsQuery: ""
        })
      })
    );
  });
});

describe("productCombinationService.searchSuggestion – tsQuery noise filtering", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * "D. MUET 5/32 x 3/4" → coreWords currently ["d.", "muet", "x"]
   * tsQuery "d.:* & muet:* & x:*" requires ALL three to match → too restrictive.
   * Single-char tokens ("x", "d" stripped from "d.") must be excluded from tsQuery.
   * Only meaningful words (length > 1 after stripping punctuation) should appear.
   *
   * Expected tsQuery: "muet:*"  (only substantive word)
   */
  it('should exclude single-char noise tokens from searchSuggestion tsQuery', async () => {
    db.sequelize.query.mockResolvedValue([]);

    await productCombinationService.searchSuggestion(
      "D. MUET 5/32 x 3/4",
      "PCS",
      6,
    );

    // tsQuery must contain "muet" and must NOT contain single-char terms
    const firstCall = db.sequelize.query.mock.calls[0];
    const { tsQuery } = firstCall[1].replacements;

    expect(tsQuery).toContain("muet:*");

    // Each term in tsQuery, after stripping :*, must have >1 meaningful char
    const terms = tsQuery.split(" & ").map(t => t.replace(/:?\*$/, "").replace(/[^a-z0-9]/g, ""));
    terms.forEach(term => {
      expect(term.length).toBeGreaterThan(1);
    });
  });

  /**
   * "C.D CX3 (1-5)" → coreWords ["c.d", "cx"] after stripping number words.
   * After noise filtering, "c.d" stripped = "cd" (2 chars, keep), "cx" (2 chars, keep).
   * Both stay. Verify no empty/single-char pollution.
   */
  it('should keep multi-char coreWords like "cd" and "cx" in tsQuery', async () => {
    db.sequelize.query.mockResolvedValue([]);

    await productCombinationService.searchSuggestion(
      "C.D CX3 (1-5)",
      "PCS",
      336.2,
    );

    const firstCall = db.sequelize.query.mock.calls[0];
    const { tsQuery } = firstCall[1].replacements;

    // "cd" or "c.d" should appear; "cx3" is a numberWord, not in coreWords
    expect(tsQuery.length).toBeGreaterThan(0);
    // Should not have single-char standalone terms
    const terms = tsQuery.split(" & ").map(t => t.replace(/:?\*/, ""));
    terms.forEach(term => {
      expect(term.replace(/[^a-z0-9]/g, "").length).toBeGreaterThan(1);
    });
  });
});

