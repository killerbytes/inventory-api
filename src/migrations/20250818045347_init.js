const Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * createTable() => "Categories", deps: []
 * createTable() => "Customers", deps: []
 * createTable() => "InventoryBreakPacks", deps: []
 * createTable() => "StockAdjustments", deps: []
 * createTable() => "Suppliers", deps: []
 * createTable() => "Users", deps: []
 * createTable() => "Products", deps: [Categories]
 * createTable() => "ProductCombinations", deps: [Products]
 * createTable() => "VariantTypes", deps: [Products]
 * createTable() => "BreakPacks", deps: [ProductCombinations, ProductCombinations, Users]
 * createTable() => "PurchaseOrders", deps: [Suppliers]
 * createTable() => "Inventories", deps: [ProductCombinations]
 * createTable() => "InventoryMovements", deps: [Users, ProductCombinations, StockAdjustments]
 * createTable() => "SalesOrders", deps: [Customers]
 * createTable() => "PurchaseOrderItems", deps: [PurchaseOrders, ProductCombinations]
 * createTable() => "OrderStatusHistories", deps: [PurchaseOrders, SalesOrders, Users]
 * createTable() => "SalesOrderItems", deps: [SalesOrders, ProductCombinations, Inventories]
 * createTable() => "VariantValues", deps: [VariantTypes]
 * createTable() => "CombinationValues", deps: [ProductCombinations, VariantValues]
 * addIndex(products_name_unit) => "Products"
 *
 */

const info = {
  revision: 1,
  name: "init",
  created: "2025-08-18T04:53:47.013Z",
  comment: "",
};

const migrationCommands = (transaction) => [
  {
    fn: "createTable",
    params: [
      "Categories",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          unique: true,
          allowNull: false,
        },
        description: { type: Sequelize.TEXT, field: "description" },
        order: { type: Sequelize.INTEGER, field: "order" },
        deletedAt: { type: Sequelize.DATE, field: "deletedAt" },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "Customers",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: { type: Sequelize.STRING, field: "name", allowNull: false },
        email: { type: Sequelize.STRING, field: "email", unique: true },
        phone: { type: Sequelize.TEXT, field: "phone" },
        address: { type: Sequelize.STRING, field: "address" },
        notes: { type: Sequelize.TEXT, field: "notes" },
        isActive: {
          type: Sequelize.BOOLEAN,
          field: "isActive",
          defaultValue: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        deletedAt: { type: Sequelize.DATE, field: "deletedAt" },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "InventoryBreakPacks",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        fromCombinationId: {
          type: Sequelize.INTEGER,
          field: "fromCombinationId",
          allowNull: false,
        },
        toCombinationId: {
          type: Sequelize.INTEGER,
          field: "toCombinationId",
          allowNull: false,
        },
        fromQuantity: {
          type: Sequelize.INTEGER,
          field: "fromQuantity",
          allowNull: false,
        },
        toQuantity: {
          type: Sequelize.INTEGER,
          field: "toQuantity",
          allowNull: false,
        },
        reason: { type: Sequelize.STRING, field: "reason" },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "StockAdjustments",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        referenceNo: { type: Sequelize.STRING, field: "referenceNo" },
        combinationId: { type: Sequelize.INTEGER, field: "combinationId" },
        systemQuantity: { type: Sequelize.INTEGER, field: "systemQuantity" },
        newQuantity: { type: Sequelize.INTEGER, field: "newQuantity" },
        difference: { type: Sequelize.INTEGER, field: "difference" },
        reason: { type: Sequelize.STRING, field: "reason" },
        notes: { type: Sequelize.STRING, field: "notes" },
        createdBy: {
          type: Sequelize.INTEGER,
          field: "createdBy",
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        deletedAt: { type: Sequelize.DATE, field: "deletedAt" },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "Suppliers",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: { type: Sequelize.STRING, field: "name", allowNull: false },
        contact: { type: Sequelize.STRING, field: "contact" },
        email: { type: Sequelize.STRING, field: "email", unique: true },
        phone: { type: Sequelize.TEXT, field: "phone" },
        address: { type: Sequelize.STRING, field: "address" },
        notes: { type: Sequelize.TEXT, field: "notes" },
        isActive: {
          type: Sequelize.BOOLEAN,
          field: "isActive",
          defaultValue: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        deletedAt: { type: Sequelize.DATE, field: "deletedAt" },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "Users",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: { type: Sequelize.STRING, field: "name", allowNull: false },
        username: {
          type: Sequelize.STRING,
          field: "username",
          unique: true,
          allowNull: false,
        },
        email: { type: Sequelize.STRING, field: "email", unique: true },
        password: {
          type: Sequelize.STRING,
          field: "password",
          allowNull: false,
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          field: "isActive",
          defaultValue: false,
        },
        isAdmin: {
          type: Sequelize.BOOLEAN,
          field: "isAdmin",
          defaultValue: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        deletedAt: { type: Sequelize.DATE, field: "deletedAt" },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "Products",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: { type: Sequelize.STRING, field: "name", allowNull: false },
        description: { type: Sequelize.TEXT, field: "description" },
        unit: { type: Sequelize.STRING, field: "unit", allowNull: false },
        categoryId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
          references: { model: "Categories", key: "id" },
          field: "categoryId",
          allowNull: false,
        },
        sku: { type: Sequelize.STRING, field: "sku" },
        conversionFactor: {
          type: Sequelize.INTEGER,
          field: "conversionFactor",
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        deletedAt: { type: Sequelize.DATE, field: "deletedAt" },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "ProductCombinations",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        productId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: { model: "Products", key: "id" },
          field: "productId",
          allowNull: false,
        },
        name: { type: Sequelize.STRING, field: "name" },
        sku: { type: Sequelize.STRING, field: "sku", unique: true },
        price: { type: Sequelize.DECIMAL(10, 2), field: "price" },
        reorderLevel: { type: Sequelize.INTEGER, field: "reorderLevel" },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        deletedAt: { type: Sequelize.DATE, field: "deletedAt" },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "VariantTypes",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: { type: Sequelize.STRING, field: "name", allowNull: false },
        productId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: { model: "Products", key: "id" },
          allowNull: true,
          field: "productId",
        },
        isTemplate: { type: Sequelize.BOOLEAN, field: "isTemplate" },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "BreakPacks",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        fromCombinationId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "ProductCombinations", key: "id" },
          field: "fromCombinationId",
          allowNull: false,
        },
        toCombinationId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "ProductCombinations", key: "id" },
          field: "toCombinationId",
          allowNull: false,
        },
        quantity: {
          type: Sequelize.INTEGER,
          field: "quantity",
          allowNull: false,
        },
        conversionFactor: {
          type: Sequelize.INTEGER,
          field: "conversionFactor",
          allowNull: false,
        },
        createdBy: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "Users", key: "id" },
          field: "createdBy",
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "PurchaseOrders",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        purchaseOrderNumber: {
          type: Sequelize.STRING,
          field: "purchaseOrderNumber",
          unique: true,
          allowNull: false,
        },
        supplierId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "Suppliers", key: "id" },
          field: "supplierId",
          allowNull: false,
        },
        status: {
          type: Sequelize.STRING,
          field: "status",
          defaultValue: "PENDING",
        },
        deliveryDate: { type: Sequelize.DATE, field: "deliveryDate" },
        cancellationReason: {
          type: Sequelize.TEXT,
          field: "cancellationReason",
        },
        totalAmount: {
          type: Sequelize.DECIMAL(10, 2),
          field: "totalAmount",
          allowNull: false,
        },
        notes: { type: Sequelize.TEXT, field: "notes" },
        internalNotes: { type: Sequelize.TEXT, field: "internalNotes" },
        modeOfPayment: {
          type: Sequelize.STRING,
          field: "modeOfPayment",
          defaultValue: "CHECK",
        },
        checkNumber: {
          type: Sequelize.STRING,
          field: "checkNumber",
          unique: true,
        },
        dueDate: { type: Sequelize.DATE, field: "dueDate" },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "Inventories",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        combinationId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "ProductCombinations", key: "id" },
          field: "combinationId",
          allowNull: false,
        },
        quantity: {
          type: Sequelize.INTEGER,
          field: "quantity",
          allowNull: false,
          defaultValue: 0,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        deletedAt: { type: Sequelize.DATE, field: "deletedAt" },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "InventoryMovements",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        type: { type: Sequelize.STRING, field: "type", allowNull: false },
        previous: {
          type: Sequelize.INTEGER,
          field: "previous",
          allowNull: false,
        },
        new: { type: Sequelize.INTEGER, field: "new", allowNull: false },
        quantity: {
          type: Sequelize.INTEGER,
          field: "quantity",
          allowNull: false,
        },
        reference: {
          type: Sequelize.INTEGER,
          field: "reference",
          allowNull: false,
        },
        reason: { type: Sequelize.STRING, field: "reason" },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        userId: {
          type: Sequelize.INTEGER,
          field: "userId",
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          references: { model: "Users", key: "id" },
          allowNull: true,
        },
        combinationId: {
          type: Sequelize.INTEGER,
          field: "combinationId",
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          references: { model: "ProductCombinations", key: "id" },
          allowNull: true,
        },
        referenceId: {
          type: Sequelize.INTEGER,
          field: "referenceId",
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          references: { model: "StockAdjustments", key: "id" },
          allowNull: true,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "SalesOrders",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        salesOrderNumber: {
          type: Sequelize.STRING,
          field: "salesOrderNumber",
          unique: true,
          allowNull: false,
        },
        customerId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: { model: "Customers", key: "id" },
          allowNull: true,
          field: "customerId",
        },
        status: {
          type: Sequelize.STRING,
          field: "status",
          allowNull: false,
          defaultValue: "PENDING",
        },
        orderDate: {
          type: Sequelize.DATE,
          field: "orderDate",
          allowNull: false,
        },
        isDelivery: {
          type: Sequelize.BOOLEAN,
          field: "isDelivery",
          defaultValue: false,
        },
        isDeliveryCompleted: {
          type: Sequelize.BOOLEAN,
          field: "isDeliveryCompleted",
        },
        deliveryAddress: { type: Sequelize.TEXT, field: "deliveryAddress" },
        deliveryInstructions: {
          type: Sequelize.TEXT,
          field: "deliveryInstructions",
        },
        deliveryDate: { type: Sequelize.DATE, field: "deliveryDate" },
        cancellationReason: {
          type: Sequelize.TEXT,
          field: "cancellationReason",
        },
        totalAmount: {
          type: Sequelize.DECIMAL(10, 2),
          field: "totalAmount",
          allowNull: false,
        },
        notes: { type: Sequelize.TEXT, field: "notes" },
        internalNotes: { type: Sequelize.TEXT, field: "internalNotes" },
        modeOfPayment: {
          type: Sequelize.STRING,
          field: "modeOfPayment",
          defaultValue: "CASH",
          allowNull: false,
        },
        checkNumber: {
          type: Sequelize.STRING,
          field: "checkNumber",
          unique: true,
        },
        dueDate: { type: Sequelize.DATE, field: "dueDate" },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "PurchaseOrderItems",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        purchaseOrderId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: { model: "PurchaseOrders", key: "id" },
          field: "purchaseOrderId",
          allowNull: false,
        },
        combinationId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "ProductCombinations", key: "id" },
          field: "combinationId",
          allowNull: false,
        },
        quantity: {
          type: Sequelize.INTEGER,
          field: "quantity",
          allowNull: false,
          defaultValue: 0,
        },
        purchasePrice: {
          type: Sequelize.DECIMAL(10, 2),
          field: "purchasePrice",
          allowNull: false,
          defaultValue: 0,
        },
        totalAmount: {
          type: Sequelize.DECIMAL(10, 2),
          field: "totalAmount",
          allowNull: false,
          defaultValue: 0,
        },
        discount: {
          type: Sequelize.DECIMAL(10, 2),
          field: "discount",
          defaultValue: 0,
        },
        discountNote: { type: Sequelize.TEXT, field: "discountNote" },
        unit: { type: Sequelize.STRING, field: "unit", allowNull: false },
        skuSnapshot: {
          type: Sequelize.STRING,
          field: "skuSnapshot",
          allowNull: false,
        },
        nameSnapshot: {
          type: Sequelize.STRING,
          field: "nameSnapshot",
          allowNull: false,
        },
        categorySnapshot: {
          type: Sequelize.JSON,
          field: "categorySnapshot",
          allowNull: false,
        },
        variantSnapshot: {
          type: Sequelize.JSON,
          field: "variantSnapshot",
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "OrderStatusHistories",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        purchaseOrderId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "PurchaseOrders", key: "id" },
          allowNull: true,
          field: "purchaseOrderId",
        },
        salesOrderId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "SalesOrders", key: "id" },
          allowNull: true,
          field: "salesOrderId",
        },
        status: { type: Sequelize.STRING, field: "status", allowNull: false },
        changedBy: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "Users", key: "id" },
          field: "changedBy",
          allowNull: false,
        },
        changedAt: {
          type: Sequelize.DATE,
          field: "changedAt",
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "SalesOrderItems",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        salesOrderId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: { model: "SalesOrders", key: "id" },
          field: "salesOrderId",
          allowNull: false,
        },
        combinationId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "ProductCombinations", key: "id" },
          field: "combinationId",
          allowNull: false,
        },
        quantity: {
          type: Sequelize.INTEGER,
          field: "quantity",
          allowNull: false,
          defaultValue: 0,
        },
        originalPrice: {
          type: Sequelize.DECIMAL(10, 2),
          field: "originalPrice",
          allowNull: false,
          defaultValue: 0,
        },
        purchasePrice: {
          type: Sequelize.DECIMAL(10, 2),
          field: "purchasePrice",
          allowNull: false,
          defaultValue: 0,
        },
        totalAmount: {
          type: Sequelize.DECIMAL(10, 2),
          field: "totalAmount",
          allowNull: false,
          defaultValue: 0,
        },
        discount: {
          type: Sequelize.DECIMAL(10, 2),
          field: "discount",
          defaultValue: 0,
        },
        unit: { type: Sequelize.STRING, field: "unit", allowNull: false },
        discountNote: { type: Sequelize.TEXT, field: "discountNote" },
        skuSnapshot: {
          type: Sequelize.STRING,
          field: "skuSnapshot",
          allowNull: false,
        },
        nameSnapshot: {
          type: Sequelize.STRING,
          field: "nameSnapshot",
          allowNull: false,
        },
        categorySnapshot: {
          type: Sequelize.JSON,
          field: "categorySnapshot",
          allowNull: false,
        },
        variantSnapshot: {
          type: Sequelize.JSON,
          field: "variantSnapshot",
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        inventoryId: {
          type: Sequelize.INTEGER,
          field: "inventoryId",
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          references: { model: "Inventories", key: "id" },
          allowNull: true,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "VariantValues",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        value: { type: Sequelize.STRING, field: "value", allowNull: false },
        variantTypeId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: { model: "VariantTypes", key: "id" },
          field: "variantTypeId",
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "CombinationValues",
      {
        combinationId: {
          type: Sequelize.INTEGER,
          unique: "CombinationValues_variantValueId_combinationId_unique",
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: { model: "ProductCombinations", key: "id" },
          primaryKey: true,
          field: "combinationId",
        },
        variantValueId: {
          type: Sequelize.INTEGER,
          unique: "CombinationValues_variantValueId_combinationId_unique",
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: { model: "VariantValues", key: "id" },
          primaryKey: true,
          field: "variantValueId",
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "addIndex",
    params: [
      "Products",
      ["name", "unit"],
      {
        indexName: "products_name_unit",
        name: "products_name_unit",
        indicesType: "UNIQUE",
        type: "UNIQUE",
        transaction,
      },
    ],
  },
];

const rollbackCommands = (transaction) => [
  {
    fn: "dropTable",
    params: ["CombinationValues", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["VariantValues", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["SalesOrderItems", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["OrderStatusHistories", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["PurchaseOrderItems", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["SalesOrders", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["InventoryMovements", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["Inventories", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["PurchaseOrders", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["BreakPacks", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["VariantTypes", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["ProductCombinations", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["Products", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["Customers", { transaction }],
  },

  {
    fn: "dropTable",
    params: ["InventoryBreakPacks", { transaction }],
  },

  {
    fn: "dropTable",
    params: ["StockAdjustments", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["Suppliers", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["Users", { transaction }],
  },

  {
    fn: "dropTable",
    params: ["Categories", { transaction }],
  },
];

const pos = 0;
const useTransaction = true;

const execute = (queryInterface, sequelize, _commands) => {
  let index = pos;
  const run = (transaction) => {
    const commands = _commands(transaction);
    return new Promise((resolve, reject) => {
      const next = () => {
        if (index < commands.length) {
          const command = commands[index];
          console.log(`[#${index}] execute: ${command.fn}`);
          index++;
          queryInterface[command.fn](...command.params).then(next, reject);
        } else resolve();
      };
      next();
    });
  };
  if (useTransaction) return queryInterface.sequelize.transaction(run);
  return run(null);
};

module.exports = {
  pos,
  useTransaction,
  up: (queryInterface, sequelize) =>
    execute(queryInterface, sequelize, migrationCommands),
  down: (queryInterface, sequelize) =>
    execute(queryInterface, sequelize, rollbackCommands),
  info,
};
