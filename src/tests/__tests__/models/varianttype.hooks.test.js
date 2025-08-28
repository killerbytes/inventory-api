const { resetDatabase } = require("../../setup");

const {
  sequelize,
  VariantType,
  VariantValue,
  Product,
  ProductCombination,
  CombinationValue,
  Inventory,
  Category,
} = require("../../../models");

describe("VariantType hooks", () => {
  let product, variantType, value1, value2, combo1, combo2;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await resetDatabase();
    await Category.create({
      name: "Tools",
      description: "Hardware tools",
    });

    product = await Product.create({
      name: "Test Product",
      baseUnit: "PCS",
      categoryId: 1,
    });
    variantType = await VariantType.create({
      name: "Size",
      productId: product.id,
    });

    value1 = await VariantValue.create({
      value: "Small",
      variantTypeId: variantType.id,
    });
    value2 = await VariantValue.create({
      value: "Large",
      variantTypeId: variantType.id,
    });

    combo1 = await ProductCombination.create({
      name: "Shovel - Small",
      productId: product.id,
      sku: "SKU-S",
      unit: "PCS",
    });
    combo2 = await ProductCombination.create({
      name: "Shovel - Large",
      productId: product.id,
      sku: "SKU-L",
      unit: "PCS",
    });

    await CombinationValue.bulkCreate([
      { combinationId: combo1.id, variantValueId: value1.id },
      { combinationId: combo2.id, variantValueId: value2.id },
    ]);

    await Inventory.bulkCreate([
      { combinationId: combo1.id, quantity: 0 },
      { combinationId: combo2.id, quantity: 10 },
    ]);
  });

  test("should block deleting a variant type if any of its values are linked to combos with inventory > 0", async () => {
    await expect(variantType.destroy()).rejects.toThrow(
      /Cannot delete variant value/
    );

    const stillType = await VariantType.findByPk(variantType.id);
    expect(stillType).not.toBeNull();
  });

  test("should allow deleting a variant type if all combos have inventory = 0", async () => {
    // set all inventory to 0
    await Inventory.update({ quantity: 0 }, { where: {} });

    await expect(variantType.destroy()).resolves.not.toThrow();

    const deletedType = await VariantType.findByPk(variantType.id);
    expect(deletedType).toBeNull();

    // combos + inventories should also be removed
    const combos = await ProductCombination.findAll();
    expect(combos.length).toBe(0);

    const invs = await Inventory.findAll();
    expect(invs.length).toBe(0);
  });
});
