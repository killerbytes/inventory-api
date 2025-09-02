const productService = require("../../services/product.service");
const productCombinationService = require("../../services/productCombination.service");
const { getMappedProductComboName } = require("../../utils/mapped");
const { shortenTitleTo, shortenNameTo } = require("../../utils/string");
const { setupDatabase, resetDatabase } = require("../setup");
const {
  combinations,
  createCategory,
  createProduct,
  createVariantType,
  createCombination,
} = require("../utils");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
});

describe("Utils", () => {
  it("should get a mapped product name", async () => {
    const result = getMappedProductComboName(
      {
        name: "Shovel",
        variants: [
          {
            id: 1,
            name: "Colors",
            values: [{ value: "Red" }, { value: "Blue" }],
          },
        ],
      },
      [{ value: "Red", variantTypeId: 1 }]
    );
    expect(result).toBe("Shovel - Red");
  });
  it("should get a mapped product name alphabetically", async () => {
    [];
    const result = getMappedProductComboName(
      {
        name: "Shovel",
        variants: [
          {
            id: 161,
            name: "1Watts",
            values: [{ value: "15w" }, { value: "30w" }],
          },
          {
            id: 162,
            name: "Type3",
            values: [{ value: "DL" }],
          },
          {
            id: 163,
            name: "Type2",
            values: [{ value: "E27" }],
          },
        ],
      },

      [
        { id: 384, value: "15w", variantTypeId: 161 },
        { id: 387, value: "DL", variantTypeId: 162 },
        { id: 388, value: "E27", variantTypeId: 163 },
      ]
    );
    expect(result).toBe("Shovel - 15w | E27 | DL");
  });

  it("should get a mapped product name separated by x", async () => {
    const result = getMappedProductComboName(
      {
        name: "Shovel",
        variants: [
          {
            id: 1,
            name: "Colors",
            values: [{ value: "Red" }, { value: "Blue" }],
          },
          {
            id: 2,
            name: "AMP_Size",
            values: [{ value: "Small" }, { value: "Medium" }],
          },
          {
            id: 3,
            name: "AMP",
            values: [{ value: "10A" }, { value: "20A" }],
          },
        ],
      },
      [
        { value: "Red", variantTypeId: 1 },
        { value: "Small", variantTypeId: 2 },
        {
          value: "10A",
          variantTypeId: 3,
        },
      ]
    );
    expect(result).toBe("Shovel - 10A x Small | Red");
  });

  it("should shorten a name to 3 characters", async () => {
    const result = shortenNameTo("Shovel - Red", 3);
    expect(result).toBe("SHO__RED");
  });
  it("should shorten a title to 3 characters", async () => {
    const result = shortenTitleTo("Shovel - Red", 3);

    expect(result).toBe("SHO_RED");
  });
});
