"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    
      await queryInterface.createTable("Categories", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        order: { type: Sequelize.INTEGER, allowNull: true },
        parentId: { type: Sequelize.INTEGER, allowNull: true }
      });
      
    
      await queryInterface.addConstraint("Categories", {
        fields: ["parentId"],
        type: "foreign key",
        name: "Categories_parentId_fkey",
        references: { table: "Categories", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
    
      await queryInterface.addIndex("Categories", {
        name: "Categories_name_key",
        unique: true,
        fields: ["name"]
      });
    
      await queryInterface.createTable("Products", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        categoryId: { type: Sequelize.INTEGER, allowNull: false },
        sku: { type: Sequelize.STRING, allowNull: true },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false },
        deletedAt: { type: Sequelize.STRING, allowNull: true },
        baseUnit: { type: Sequelize.STRING, allowNull: false, defaultValue: "PCS" }
      });
      
    
      await queryInterface.addConstraint("Products", {
        fields: ["categoryId"],
        type: "foreign key",
        name: "Products_categoryId_fkey",
        references: { table: "Categories", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      });
    
      await queryInterface.addIndex("Products", {
        name: "products_deleted_at",
        unique: false,
        fields: ["deletedAt"]
      });
    
      await queryInterface.addIndex("Products", {
        name: "unique_active_name",
        unique: true,
        fields: ["name"]
      });
    
      await queryInterface.createTable("ProductCombinations", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        productId: { type: Sequelize.INTEGER, allowNull: false },
        name: { type: Sequelize.STRING, allowNull: true },
        sku: { type: Sequelize.STRING, allowNull: false },
        price: { type: Sequelize.DECIMAL, allowNull: true },
        reorderLevel: { type: Sequelize.INTEGER, allowNull: true },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false },
        deletedAt: { type: Sequelize.STRING, allowNull: true },
        unit: { type: Sequelize.STRING, allowNull: false },
        conversionFactor: { type: Sequelize.STRING, allowNull: false }
      });
      
    
      await queryInterface.addConstraint("ProductCombinations", {
        fields: ["productId"],
        type: "foreign key",
        name: "ProductCombinations_productId_fkey",
        references: { table: "Products", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      });
    
      await queryInterface.addIndex("ProductCombinations", {
        name: "product_combinations_deleted_at",
        unique: false,
        fields: ["deletedAt"]
      });
    
      await queryInterface.addIndex("ProductCombinations", {
        name: "unique_active_sku",
        unique: true,
        fields: ["sku"]
      });
    
      await queryInterface.createTable("VariantTypes", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false },
        productId: { type: Sequelize.INTEGER, allowNull: true },
        isTemplate: { type: Sequelize.BOOLEAN, allowNull: true },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false }
      });
      
    
      await queryInterface.addConstraint("VariantTypes", {
        fields: ["productId"],
        type: "foreign key",
        name: "VariantTypes_productId_fkey",
        references: { table: "Products", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      });
    
      await queryInterface.createTable("VariantValues", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        value: { type: Sequelize.STRING, allowNull: false },
        variantTypeId: { type: Sequelize.INTEGER, allowNull: false },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false }
      });
      
    
      await queryInterface.addConstraint("VariantValues", {
        fields: ["variantTypeId"],
        type: "foreign key",
        name: "VariantValues_variantTypeId_fkey",
        references: { table: "VariantTypes", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      });
    
      await queryInterface.createTable("CombinationValues", {
        combinationId: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true },
        variantValueId: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false }
      });
      
    
      await queryInterface.addConstraint("CombinationValues", {
        fields: ["combinationId"],
        type: "foreign key",
        name: "CombinationValues_combinationId_fkey",
        references: { table: "ProductCombinations", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      });
    
      await queryInterface.addConstraint("CombinationValues", {
        fields: ["variantValueId"],
        type: "foreign key",
        name: "CombinationValues_variantValueId_fkey",
        references: { table: "VariantValues", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      });
    
      await queryInterface.createTable("Customers", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false },
        email: { type: Sequelize.STRING, allowNull: true },
        phone: { type: Sequelize.TEXT, allowNull: true },
        address: { type: Sequelize.STRING, allowNull: true },
        notes: { type: Sequelize.TEXT, allowNull: true },
        isActive: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: true },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false },
        deletedAt: { type: Sequelize.STRING, allowNull: true }
      });
      
    
      await queryInterface.addIndex("Customers", {
        name: "Customers_email_key",
        unique: true,
        fields: ["email"]
      });
    
      await queryInterface.addIndex("Customers", {
        name: "customers_deleted_at",
        unique: false,
        fields: ["deletedAt"]
      });
    
      await queryInterface.createTable("Users", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false },
        username: { type: Sequelize.STRING, allowNull: false },
        email: { type: Sequelize.STRING, allowNull: true },
        password: { type: Sequelize.STRING, allowNull: false },
        isActive: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
        isAdmin: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false },
        deletedAt: { type: Sequelize.STRING, allowNull: true }
      });
      
    
      await queryInterface.addIndex("Users", {
        name: "Users_email_key",
        unique: true,
        fields: ["email"]
      });
    
      await queryInterface.addIndex("Users", {
        name: "Users_username_key",
        unique: true,
        fields: ["username"]
      });
    
      await queryInterface.addIndex("Users", {
        name: "users_deleted_at",
        unique: false,
        fields: ["deletedAt"]
      });
    
      await queryInterface.createTable("Suppliers", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false },
        contact: { type: Sequelize.STRING, allowNull: true },
        email: { type: Sequelize.STRING, allowNull: true },
        phone: { type: Sequelize.TEXT, allowNull: true },
        address: { type: Sequelize.STRING, allowNull: true },
        notes: { type: Sequelize.TEXT, allowNull: true },
        isActive: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: true },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false },
        deletedAt: { type: Sequelize.STRING, allowNull: true }
      });
      
    
      await queryInterface.addIndex("Suppliers", {
        name: "Suppliers_email_key",
        unique: true,
        fields: ["email"]
      });
    
      await queryInterface.addIndex("Suppliers", {
        name: "suppliers_deleted_at",
        unique: false,
        fields: ["deletedAt"]
      });
    
      await queryInterface.createTable("Invoices", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        supplierId: { type: Sequelize.INTEGER, allowNull: false },
        invoiceNumber: { type: Sequelize.STRING, allowNull: false },
        invoiceDate: { type: Sequelize.STRING, allowNull: false },
        dueDate: { type: Sequelize.STRING, allowNull: false },
        status: { type: Sequelize.STRING, allowNull: false, defaultValue: "DRAFT" },
        totalAmount: { type: Sequelize.DECIMAL, allowNull: false },
        notes: { type: Sequelize.STRING, allowNull: true },
        changedBy: { type: Sequelize.INTEGER, allowNull: false },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false },
        deletedAt: { type: Sequelize.STRING, allowNull: true }
      });
      
    
      await queryInterface.addConstraint("Invoices", {
        fields: ["changedBy"],
        type: "foreign key",
        name: "Invoices_changedBy_fkey",
        references: { table: "Users", field: "id" },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      });
    
      await queryInterface.addConstraint("Invoices", {
        fields: ["supplierId"],
        type: "foreign key",
        name: "Invoices_supplierId_fkey",
        references: { table: "Suppliers", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      });
    
      await queryInterface.addIndex("Invoices", {
        name: "invoices_deleted_at",
        unique: false,
        fields: ["deletedAt"]
      });
    
      await queryInterface.createTable("InventoryBreakPacks", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        fromCombinationId: { type: Sequelize.INTEGER, allowNull: false },
        toCombinationId: { type: Sequelize.INTEGER, allowNull: false },
        fromQuantity: { type: Sequelize.INTEGER, allowNull: false },
        toQuantity: { type: Sequelize.INTEGER, allowNull: false },
        reason: { type: Sequelize.STRING, allowNull: true },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false }
      });
      
    
      await queryInterface.createTable("GoodReceipts", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        supplierId: { type: Sequelize.INTEGER, allowNull: false },
        status: { type: Sequelize.STRING, allowNull: true, defaultValue: "DRAFT" },
        receiptDate: { type: Sequelize.STRING, allowNull: true },
        cancellationReason: { type: Sequelize.TEXT, allowNull: true },
        totalAmount: { type: Sequelize.DECIMAL, allowNull: false },
        referenceNo: { type: Sequelize.TEXT, allowNull: true },
        internalNotes: { type: Sequelize.TEXT, allowNull: true },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false },
        deletedAt: { type: Sequelize.STRING, allowNull: true }
      });
      
    
      await queryInterface.addConstraint("GoodReceipts", {
        fields: ["supplierId"],
        type: "foreign key",
        name: "PurchaseOrders_supplierId_fkey",
        references: { table: "Suppliers", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION"
      });
    
      await queryInterface.addIndex("GoodReceipts", {
        name: "good_receipts_deleted_at",
        unique: false,
        fields: ["deletedAt"]
      });
    
      await queryInterface.createTable("SalesOrders", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        salesOrderNumber: { type: Sequelize.STRING, allowNull: false },
        customerId: { type: Sequelize.INTEGER, allowNull: true },
        status: { type: Sequelize.STRING, allowNull: false, defaultValue: "DRAFT" },
        isDelivery: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
        isDeliveryCompleted: { type: Sequelize.BOOLEAN, allowNull: true },
        deliveryAddress: { type: Sequelize.TEXT, allowNull: true },
        deliveryInstructions: { type: Sequelize.TEXT, allowNull: true },
        deliveryDate: { type: Sequelize.STRING, allowNull: true },
        cancellationReason: { type: Sequelize.TEXT, allowNull: true },
        totalAmount: { type: Sequelize.DECIMAL, allowNull: false },
        notes: { type: Sequelize.TEXT, allowNull: true },
        internalNotes: { type: Sequelize.TEXT, allowNull: true },
        modeOfPayment: { type: Sequelize.STRING, allowNull: false, defaultValue: "CASH" },
        checkNumber: { type: Sequelize.STRING, allowNull: true },
        dueDate: { type: Sequelize.STRING, allowNull: true },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false },
        deletedAt: { type: Sequelize.STRING, allowNull: true }
      });
      
    
      await queryInterface.addConstraint("SalesOrders", {
        fields: ["customerId"],
        type: "foreign key",
        name: "SalesOrders_customerId_fkey",
        references: { table: "Customers", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      });
    
      await queryInterface.addIndex("SalesOrders", {
        name: "SalesOrders_checkNumber_key",
        unique: true,
        fields: ["checkNumber"]
      });
    
      await queryInterface.addIndex("SalesOrders", {
        name: "SalesOrders_salesOrderNumber_key",
        unique: true,
        fields: ["salesOrderNumber"]
      });
    
      await queryInterface.addIndex("SalesOrders", {
        name: "sales_orders_deleted_at",
        unique: false,
        fields: ["deletedAt"]
      });
    
      await queryInterface.createTable("OrderStatusHistories", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        goodReceiptId: { type: Sequelize.INTEGER, allowNull: true },
        salesOrderId: { type: Sequelize.INTEGER, allowNull: true },
        status: { type: Sequelize.STRING, allowNull: false },
        changedBy: { type: Sequelize.INTEGER, allowNull: false },
        changedAt: { type: Sequelize.STRING, allowNull: false },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false }
      });
      
    
      await queryInterface.addConstraint("OrderStatusHistories", {
        fields: ["changedBy"],
        type: "foreign key",
        name: "OrderStatusHistories_changedBy_fkey",
        references: { table: "Users", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION"
      });
    
      await queryInterface.addConstraint("OrderStatusHistories", {
        fields: ["goodReceiptId"],
        type: "foreign key",
        name: "OrderStatusHistories_purchaseOrderId_fkey",
        references: { table: "GoodReceipts", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION"
      });
    
      await queryInterface.addConstraint("OrderStatusHistories", {
        fields: ["salesOrderId"],
        type: "foreign key",
        name: "OrderStatusHistories_salesOrderId_fkey",
        references: { table: "SalesOrders", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION"
      });
    
      await queryInterface.createTable("GoodReceiptLines", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        goodReceiptId: { type: Sequelize.INTEGER, allowNull: false },
        combinationId: { type: Sequelize.INTEGER, allowNull: false },
        quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: "0" },
        purchasePrice: { type: Sequelize.DECIMAL, allowNull: false, defaultValue: "0" },
        totalAmount: { type: Sequelize.DECIMAL, allowNull: false, defaultValue: "0" },
        discount: { type: Sequelize.DECIMAL, allowNull: true, defaultValue: "0" },
        discountNote: { type: Sequelize.TEXT, allowNull: true },
        unit: { type: Sequelize.STRING, allowNull: false },
        skuSnapshot: { type: Sequelize.STRING, allowNull: false },
        nameSnapshot: { type: Sequelize.STRING, allowNull: false },
        categorySnapshot: { type: Sequelize.JSON, allowNull: false },
        variantSnapshot: { type: Sequelize.JSON, allowNull: false },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false },
        deletedAt: { type: Sequelize.STRING, allowNull: true }
      });
      
    
      await queryInterface.addConstraint("GoodReceiptLines", {
        fields: ["combinationId"],
        type: "foreign key",
        name: "PurchaseOrderItems_combinationId_fkey",
        references: { table: "ProductCombinations", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION"
      });
    
      await queryInterface.addConstraint("GoodReceiptLines", {
        fields: ["goodReceiptId"],
        type: "foreign key",
        name: "PurchaseOrderItems_purchaseOrderId_fkey",
        references: { table: "GoodReceipts", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      });
    
      await queryInterface.addIndex("GoodReceiptLines", {
        name: "good_receipt_lines_deleted_at",
        unique: false,
        fields: ["deletedAt"]
      });
    
      await queryInterface.createTable("PriceHistories", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        productId: { type: Sequelize.INTEGER, allowNull: false },
        combinationId: { type: Sequelize.INTEGER, allowNull: true },
        fromPrice: { type: Sequelize.DECIMAL, allowNull: false },
        toPrice: { type: Sequelize.DECIMAL, allowNull: false },
        changedBy: { type: Sequelize.INTEGER, allowNull: false },
        changedAt: { type: Sequelize.STRING, allowNull: false },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false }
      });
      
    
      await queryInterface.createTable("BreakPacks", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        fromCombinationId: { type: Sequelize.INTEGER, allowNull: false },
        toCombinationId: { type: Sequelize.INTEGER, allowNull: false },
        quantity: { type: Sequelize.INTEGER, allowNull: false },
        conversionFactor: { type: Sequelize.INTEGER, allowNull: false },
        createdBy: { type: Sequelize.INTEGER, allowNull: false },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false }
      });
      
    
      await queryInterface.addConstraint("BreakPacks", {
        fields: ["createdBy"],
        type: "foreign key",
        name: "BreakPacks_createdBy_fkey",
        references: { table: "Users", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION"
      });
    
      await queryInterface.addConstraint("BreakPacks", {
        fields: ["fromCombinationId"],
        type: "foreign key",
        name: "BreakPacks_fromCombinationId_fkey",
        references: { table: "ProductCombinations", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION"
      });
    
      await queryInterface.addConstraint("BreakPacks", {
        fields: ["toCombinationId"],
        type: "foreign key",
        name: "BreakPacks_toCombinationId_fkey",
        references: { table: "ProductCombinations", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION"
      });
    
      await queryInterface.createTable("Inventories", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        combinationId: { type: Sequelize.INTEGER, allowNull: false },
        quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: "0" },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false },
        deletedAt: { type: Sequelize.STRING, allowNull: true },
        averagePrice: { type: Sequelize.DECIMAL, allowNull: true }
      });
      
    
      await queryInterface.addConstraint("Inventories", {
        fields: ["combinationId"],
        type: "foreign key",
        name: "Inventories_combinationId_fkey",
        references: { table: "ProductCombinations", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION"
      });
    
      await queryInterface.addIndex("Inventories", {
        name: "inventories_deleted_at",
        unique: false,
        fields: ["deletedAt"]
      });
    
      await queryInterface.addIndex("Inventories", {
        name: "unique_combination_id",
        unique: true,
        fields: ["combinationId"]
      });
    
      await queryInterface.createTable("StockAdjustments", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        referenceNo: { type: Sequelize.STRING, allowNull: true },
        combinationId: { type: Sequelize.INTEGER, allowNull: true },
        systemQuantity: { type: Sequelize.INTEGER, allowNull: true },
        newQuantity: { type: Sequelize.INTEGER, allowNull: true },
        difference: { type: Sequelize.INTEGER, allowNull: true },
        reason: { type: Sequelize.STRING, allowNull: true },
        notes: { type: Sequelize.STRING, allowNull: true },
        createdBy: { type: Sequelize.INTEGER, allowNull: false },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false }
      });
      
    
      await queryInterface.createTable("InventoryMovements", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        type: { type: Sequelize.STRING, allowNull: false },
        quantity: { type: Sequelize.INTEGER, allowNull: false },
        reason: { type: Sequelize.STRING, allowNull: true },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false },
        userId: { type: Sequelize.INTEGER, allowNull: true },
        combinationId: { type: Sequelize.INTEGER, allowNull: true },
        referenceId: { type: Sequelize.INTEGER, allowNull: true },
        costPerUnit: { type: Sequelize.DECIMAL, allowNull: true },
        totalCost: { type: Sequelize.DECIMAL, allowNull: true },
        referenceType: { type: Sequelize.STRING, allowNull: true }
      });
      
    
      await queryInterface.addConstraint("InventoryMovements", {
        fields: ["combinationId"],
        type: "foreign key",
        name: "InventoryMovements_combinationId_fkey",
        references: { table: "ProductCombinations", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
    
      await queryInterface.addConstraint("InventoryMovements", {
        fields: ["referenceId"],
        type: "foreign key",
        name: "InventoryMovements_referenceId_fkey",
        references: { table: "StockAdjustments", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
    
      await queryInterface.addConstraint("InventoryMovements", {
        fields: ["userId"],
        type: "foreign key",
        name: "InventoryMovements_userId_fkey",
        references: { table: "Users", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
    
      await queryInterface.createTable("Payments", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        supplierId: { type: Sequelize.INTEGER, allowNull: false },
        paymentDate: { type: Sequelize.STRING, allowNull: false },
        referenceNo: { type: Sequelize.STRING, allowNull: true },
        amount: { type: Sequelize.DECIMAL, allowNull: false },
        notes: { type: Sequelize.STRING, allowNull: true },
        changedBy: { type: Sequelize.INTEGER, allowNull: false },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false },
        deletedAt: { type: Sequelize.STRING, allowNull: true }
      });
      
    
      await queryInterface.addConstraint("Payments", {
        fields: ["changedBy"],
        type: "foreign key",
        name: "Payments_changedBy_fkey",
        references: { table: "Users", field: "id" },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      });
    
      await queryInterface.addConstraint("Payments", {
        fields: ["supplierId"],
        type: "foreign key",
        name: "Payments_supplierId_fkey",
        references: { table: "Suppliers", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      });
    
      await queryInterface.addIndex("Payments", {
        name: "payments_deleted_at",
        unique: false,
        fields: ["deletedAt"]
      });
    
      await queryInterface.createTable("PaymentApplications", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        paymentId: { type: Sequelize.INTEGER, allowNull: false },
        invoiceId: { type: Sequelize.INTEGER, allowNull: false },
        amountApplied: { type: Sequelize.DECIMAL, allowNull: false },
        amountRemaining: { type: Sequelize.DECIMAL, allowNull: false },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false },
        deletedAt: { type: Sequelize.STRING, allowNull: true }
      });
      
    
      await queryInterface.addConstraint("PaymentApplications", {
        fields: ["invoiceId"],
        type: "foreign key",
        name: "PaymentApplications_invoiceId_fkey",
        references: { table: "Invoices", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      });
    
      await queryInterface.addConstraint("PaymentApplications", {
        fields: ["paymentId"],
        type: "foreign key",
        name: "PaymentApplications_paymentId_fkey",
        references: { table: "Payments", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      });
    
      await queryInterface.addIndex("PaymentApplications", {
        name: "payment_applications_deleted_at",
        unique: false,
        fields: ["deletedAt"]
      });
    
      await queryInterface.createTable("SalesOrderItems", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        salesOrderId: { type: Sequelize.INTEGER, allowNull: false },
        combinationId: { type: Sequelize.INTEGER, allowNull: false },
        quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: "0" },
        originalPrice: { type: Sequelize.DECIMAL, allowNull: false, defaultValue: "0" },
        purchasePrice: { type: Sequelize.DECIMAL, allowNull: false, defaultValue: "0" },
        totalAmount: { type: Sequelize.DECIMAL, allowNull: false, defaultValue: "0" },
        discount: { type: Sequelize.DECIMAL, allowNull: true, defaultValue: "0" },
        unit: { type: Sequelize.STRING, allowNull: false },
        discountNote: { type: Sequelize.TEXT, allowNull: true },
        skuSnapshot: { type: Sequelize.STRING, allowNull: false },
        nameSnapshot: { type: Sequelize.STRING, allowNull: false },
        categorySnapshot: { type: Sequelize.JSON, allowNull: false },
        variantSnapshot: { type: Sequelize.JSON, allowNull: false },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false },
        inventoryId: { type: Sequelize.INTEGER, allowNull: true },
        deletedAt: { type: Sequelize.STRING, allowNull: true }
      });
      
    
      await queryInterface.addConstraint("SalesOrderItems", {
        fields: ["combinationId"],
        type: "foreign key",
        name: "SalesOrderItems_combinationId_fkey",
        references: { table: "ProductCombinations", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION"
      });
    
      await queryInterface.addConstraint("SalesOrderItems", {
        fields: ["inventoryId"],
        type: "foreign key",
        name: "SalesOrderItems_inventoryId_fkey",
        references: { table: "Inventories", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
    
      await queryInterface.addConstraint("SalesOrderItems", {
        fields: ["salesOrderId"],
        type: "foreign key",
        name: "SalesOrderItems_salesOrderId_fkey",
        references: { table: "SalesOrders", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      });
    
      await queryInterface.addIndex("SalesOrderItems", {
        name: "sales_order_items_deleted_at",
        unique: false,
        fields: ["deletedAt"]
      });
    
      await queryInterface.createTable("SequelizeMeta", {
        name: { type: Sequelize.STRING, allowNull: false, primaryKey: true }
      });
      
    
      await queryInterface.createTable("InvoiceLines", {
        id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        invoiceId: { type: Sequelize.INTEGER, allowNull: false },
        goodReceiptId: { type: Sequelize.INTEGER, allowNull: false },
        amount: { type: Sequelize.DECIMAL, allowNull: false },
        createdAt: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.STRING, allowNull: false },
        deletedAt: { type: Sequelize.STRING, allowNull: true }
      });
      
    
      await queryInterface.addConstraint("InvoiceLines", {
        fields: ["goodReceiptId"],
        type: "foreign key",
        name: "InvoiceLines_goodReceiptId_fkey",
        references: { table: "GoodReceipts", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      });
    
      await queryInterface.addConstraint("InvoiceLines", {
        fields: ["invoiceId"],
        type: "foreign key",
        name: "InvoiceLines_invoiceId_fkey",
        references: { table: "Invoices", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      });
    
      await queryInterface.addIndex("InvoiceLines", {
        name: "invoice_lines_deleted_at",
        unique: false,
        fields: ["deletedAt"]
      });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("InvoiceLines");
    await queryInterface.dropTable("SequelizeMeta");
    await queryInterface.dropTable("SalesOrderItems");
    await queryInterface.dropTable("PaymentApplications");
    await queryInterface.dropTable("Payments");
    await queryInterface.dropTable("InventoryMovements");
    await queryInterface.dropTable("StockAdjustments");
    await queryInterface.dropTable("Inventories");
    await queryInterface.dropTable("BreakPacks");
    await queryInterface.dropTable("PriceHistories");
    await queryInterface.dropTable("GoodReceiptLines");
    await queryInterface.dropTable("OrderStatusHistories");
    await queryInterface.dropTable("SalesOrders");
    await queryInterface.dropTable("GoodReceipts");
    await queryInterface.dropTable("InventoryBreakPacks");
    await queryInterface.dropTable("Invoices");
    await queryInterface.dropTable("Suppliers");
    await queryInterface.dropTable("Users");
    await queryInterface.dropTable("Customers");
    await queryInterface.dropTable("CombinationValues");
    await queryInterface.dropTable("VariantValues");
    await queryInterface.dropTable("VariantTypes");
    await queryInterface.dropTable("ProductCombinations");
    await queryInterface.dropTable("Products");
    await queryInterface.dropTable("Categories");
  },
};
