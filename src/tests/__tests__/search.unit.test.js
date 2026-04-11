
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
