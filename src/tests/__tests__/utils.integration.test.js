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
} = require("../utils");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
  await createCategory(0);
  await createProduct(0);
  await createVariantType(0);
});

describe("Utils", () => {
  it("should get a mapped product name", async () => {
    await productCombinationService.updateByProductId(1, {
      combinations,
    });

    const product = await productService.get(1);
    const result = getMappedProductComboName(
      product,
      product.combinations[0].values
    );

    expect(result).toBe("Shovel - Red");
  });
  it("should shorten a name to 3 characters", async () => {
    const result = shortenNameTo("Shovel - Red", 3);
    expect(result).toBe("SHO__RED");
  });
  it("should shorten a title to 3 characters", async () => {
    const result = shortenTitleTo("Shovel - Red", 3);
    console.log(result);

    expect(result).toBe("SHO_RED");
  });
});
