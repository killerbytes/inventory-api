const request = require("supertest");
const categoryService = require("../services/category.service");
const invoiceService = require("../services/invoice.service");
const productService = require("../services/product.service");
const productCombinationService = require("../services/productCombination.service");
const supplierService = require("../services/supplier.service");
const userService = require("../services/user.service");
const variantTypeService = require("../services/variantType.service");
const app = require("../app");
const customerService = require("../services/customer.service");
const goodReceiptService = require("../services/goodReceipt.service");

function getConstraintFields(err) {
  if (!err || !err.fields) return [];
  return Array.isArray(err.fields) ? err.fields : Object.keys(err.fields);
}

function createCategory(index) {
  return categoryService.create({ ...categories[index] });
}
async function createUser(index) {
  await userService.create({ ...users[index] });
  await userService.update(1, { isActive: true });
  return;
}
function createCustomer(index) {
  return customerService.create({ ...customers[index] });
}

function createProduct(index) {
  return productService.create({ ...products[index] });
}

function createVariantType(index) {
  return variantTypeService.create({ ...variantTypes[index] });
}

function createSupplier(index) {
  return supplierService.create({ ...suppliers[index] });
}

function createCombination(index) {
  return productCombinationService.updateByProductId(1, {
    combinations,
  });
}
function createStockAdjustment(index) {
  return productCombinationService.stockAdjustment({
    ...stockAdjustments[index],
  });
}
function createGoodReceipt(index) {
  return goodReceiptService.create({
    ...goodReceipts[index],
  });
}
function updateGoodReceiptStatus(id) {
  return goodReceiptService.update(id, {
    status: "RECEIVED",
  });
}

async function createInvoice() {
  const lines = [
    {
      amount: 100,
      goodReceiptId: 1,
    },
    {
      amount: 200,
      goodReceiptId: 2,
    },
  ];

  await invoiceService.create({
    invoiceNumber: "TEST",
    invoiceDate: new Date(),
    dueDate: new Date(),
    supplierId: 1,
    totalAmount: lines.reduce((acc, item) => acc + item.amount, 0),
    invoiceLines: lines,
  });
}

async function loginUser() {
  const res = await request(app)
    .post("/api/auth/login")
    .set("Accept", "application/json") // tell server to expect json
    .set("Content-Type", "application/json")
    .send({ username: "alice", password: "123456" });

  const token = res.body.token;

  return token;
}

async function getUser(token) {
  const me = await request(app)
    .get("/api/auth/me")
    .set("x-access-token", token);
  return me;
}

const stockAdjustments = [
  {
    combinationId: 1,
    newQuantity: 11,
    reason: "SUPPLIER_BONUS",
    notes: "test",
  },
  {
    combinationId: 2,
    newQuantity: 20,
    reason: "SAMPLE",
    notes: "test",
  },
];
const customers = [
  {
    name: "Alice",
    email: "alice@test.com",
    phone: "1234567890",
    address: "123 Main St",
  },
  {
    name: "Charlie",
    email: "charlie@test.com",
    phone: "546545434",
    address: "432 Main St",
  },
];
const combinations = [
  {
    name: "Shovel - Red",
    price: 100,
    unit: "BOX",
    reorderLevel: 1,
    conversionFactor: 24,
    values: [
      {
        value: "Red",
        variantTypeId: 1,
      },
    ],
  },
  {
    price: 100,
    unit: "PCS",
    reorderLevel: 1,
    conversionFactor: 1,
    values: [
      {
        value: "Red",
        variantTypeId: 1,
      },
    ],
  },
];
const suppliers = [
  {
    name: "Alice",
    email: "alice@test.com",
    phone: "1234567890",
    address: "123 Main St",
    notes: "This is a note",
    isActive: true,
  },
  {
    name: "Charlie",
    email: "charlie@test.com",
    phone: "546545434",
    address: "432 Main St",
    notes: "This is a note",
    isActive: true,
  },
];
const users = [
  {
    name: "Alice",
    email: "alice@test.com",
    username: "alice",
    password: "123456",
    confirmPassword: "123456",
  },
  {
    name: "Charlie",
    email: "charlie@test.com",
    username: "charlie",
    password: "123456",
    confirmPassword: "123456",
  },
];

const categories = [
  {
    name: "Tools",
    description: "Hardware tools",
  },
  {
    name: "Electronics",
    description: "Electronics",
  },
];
const products = [
  {
    name: "Shovel",
    description: "Shovel BOX",
    baseUnit: "BOX",
    categoryId: 1,
  },
  {
    name: "Wire",
    description: "Wire",
    baseUnit: "PCS",
    categoryId: 2,
  },
  {
    name: "Shovel",
    description: "Shovel PCS",
    baseUnit: "PCS",
    categoryId: 1,
  },
];

const variantTypes = [
  {
    name: "Colors",
    productId: 1,
    values: [{ value: "Red" }, { value: "Blue" }],
  },
  {
    name: "Size",
    productId: 1,
    values: [{ value: "Small" }, { value: "Medium" }],
  },
  {
    name: "AMP",
    productId: 1,
    values: [{ value: "10A" }, { value: "20A" }],
  },
];

const goodReceipts = [
  {
    supplierId: 1,
    receiptDate: new Date(),
    referenceNo: "REF1",
    internalNotes: "Test Internal Notes",
    goodReceiptLines: [
      {
        combinationId: 1,
        quantity: 10,
        purchasePrice: 100,
      },
      {
        combinationId: 2,
        quantity: 20,
        discount: 10,
        purchasePrice: 100,
      },
    ],
  },
  {
    supplierId: 1,
    receiptDate: new Date(),
    referenceNo: "REF2",
    internalNotes: "Test Internal Notes",
    goodReceiptLines: [
      {
        combinationId: 1,
        quantity: 10,
        purchasePrice: 100,
      },
      {
        combinationId: 2,
        quantity: 20,
        discount: 10,
        purchasePrice: 100,
      },
    ],
  },
  {
    supplierId: 1,
    receiptDate: new Date(),
    referenceNo: "REF3",
    internalNotes: "Test Internal Notes",
    goodReceiptLines: [
      {
        combinationId: 1,
        quantity: 10,
        purchasePrice: 100,
      },
      {
        combinationId: 2,
        quantity: 20,
        discount: 10,
        purchasePrice: 100,
      },
    ],
  },
  {
    supplierId: 2,
    receiptDate: new Date(),
    referenceNo: "REF2222",
    internalNotes: "Supplier #2",
    goodReceiptLines: [
      {
        combinationId: 1,
        quantity: 10,
        purchasePrice: 100,
      },
      {
        combinationId: 2,
        quantity: 20,
        discount: 10,
        purchasePrice: 100,
      },
    ],
  },
];

module.exports = {
  getConstraintFields,
  createUser,
  createProduct,
  createCategory,
  createSupplier,
  createVariantType,
  createCombination,
  createCustomer,
  createStockAdjustment,
  createGoodReceipt,
  createInvoice,
  loginUser,
  getUser,
  updateGoodReceiptStatus,
  combinations,
  suppliers,
  users,
  categories,
  products,
  customers,
  stockAdjustments,
  goodReceipts,
};
