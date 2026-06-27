const { gql } = require("graphql-tag");

const typeDefs = gql`
  scalar JSON
  scalar Date

  type PaginationMeta {
    total: Int
    totalPages: Int
    currentPage: Int
  }

  type TokenPayload {
    accessToken: String!
  }

  type User {
    id: ID!
    name: String!
    username: String!
    email: String!
    role: String
    permissions: JSON
    isActive: Boolean
    createdAt: Date
    updatedAt: Date
  }

  type Category {
    id: ID!
    name: String!
    description: String
    order: Int
    parentId: Int
  }

  type Product {
    id: ID
    name: String
    description: String
    baseUnit: String
    categoryId: Int
    sku: String
    combinations: [ProductCombination]
    variants: [VariantType]
  }

  type Customer {
    id: ID!
    name: String!
    email: String
    phone: String
    address: String
    createdAt: Date
    updatedAt: Date
  }

  type Supplier {
    id: ID!
    name: String!
    email: String
    phone: String
    address: String
    createdAt: Date
    updatedAt: Date
  }

  type Suppliers {
    data: [Supplier]
    meta: PaginationMeta
  }

  type InventoryMovement {
    id: ID!
    productId: Int!
    type: String!
    quantity: Int!
    createdAt: Date
  }

  type PaginatedInventoryMovement {
    data: [InventoryMovement]
    meta: PaginationMeta
  }

  type OrderStatusHistory {
    id: ID!
    status: String!
    user: User
    createdAt: Date
    salesOrderId: ID
  }

  type SalesOrder {
    id: ID!
    salesOrderNumber: String
    orderDate: Date
    status: String!
    customerId: Int
    customer: Customer
    modeOfPayment: String
    notes: String
    internalNotes: String
    totalAmount: Float
    totalReturnAmount: Float
    totalExchangeAmount: Float
    salesOrderStatusHistory: [OrderStatusHistory]
    salesOrderHistory: [OrderStatusHistory]
    salesOrderItems: [SalesOrderItem]
  }

  type SalesOrderItem {
    id: ID!
    salesOrderId: Int
    combinationId: Int
    combinations: ProductCombination
    nameSnapshot: String
    unit: String
    quantity: Int
    originalPrice: Float
    purchasePrice: Float
    totalAmount: Float
    discount: Float
    discountNote: String
  }

  type PaginatedSalesOrders {
    data: [SalesOrder]
    meta: PaginationMeta
    summary: [JSON]
  }

  type InvoiceLine {
    id: ID!
    invoiceId: Int
    goodReceiptId: Int
    amount: Float
    goodReceipt: GoodReceipt
    createdAt: Date
    updatedAt: Date
  }

  type Invoice {
    id: ID!
    invoiceNumber: String!
    invoiceDate: Date
    dueDate: Date
    status: String!
    salesOrderId: Int
    supplierId: Int
    supplier: Supplier
    totalAmount: Float
    notes: String
    invoiceLines: [InvoiceLine]
    applications: [PaymentApplication]
    createdAt: Date
    updatedAt: Date
  }

  type PaginatedInvoices {
    data: [Invoice]
    meta: PaginationMeta
  }

  type Payment {
    id: ID!
    referenceNo: String
    paymentNumber: String!
    paymentDate: Date
    status: String
    customerId: Int
    customer: Customer
    supplier: Supplier
    user: User
    totalAmount: Float
    totalReturnAmount: Float
    createdAt: Date
    updatedAt: Date
  }
  type PaymentApplication {
    id: ID!
    amountApplied: Float
    amountRemaining: Float
    invoice: Invoice
    payment: Payment
    createdAt: Date
    updatedAt: Date
  }

  type PaginatedPayments {
    data: [PaymentApplication]
    meta: PaginationMeta
  }

  type GoodReceipt {
    id: ID!
    referenceNo: String
    receiptNumber: String!
    receiptDate: Date
    status: String
    supplierId: Int
    supplier: Supplier
    totalAmount: Float
    totalReturnAmount: Float
    goodReceiptLines: [GoodReceiptLine]
    createdAt: Date
    updatedAt: Date
  }

  type GoodReceiptLine {
    id: ID
    goodReceiptId: Int
    nameSnapshot: String
    unit: String
    quantity: Int
    purchasePrice: Float
    totalAmount: Float
    combinations: ProductCombination
    combinationId: Int
    goodReceipt: GoodReceipt
    skuSnapshot: String
    discount: Float
    discountNote: String
  }

  type PaginatedGoodReceipts {
    data: [GoodReceipt]
    meta: PaginationMeta
  }

  type VariantType {
    id: ID!
    name: String!
    values: [VariantValue]
    isBreakpackFilter: Boolean
    isTemplate: Boolean
    productId: Int
  }

  type VariantValue {
    id: ID!
    value: String!
    variantTypeId: Int
  }

  type ProductCombination {
    id: ID
    productId: Int
    name: String
    unit: String
    conversionFactor: Int
    barcode: String
    isBreakPack: Boolean
    isActive: Boolean
    reorderLevel: Int
    sku: String
    price: Float
    stock: Int
    inventory: Inventory
    priceHistories: [PriceHistory]
    product: Product
  }

  type Inventory {
    id: ID!
    combinationId: Int
    quantity: Int
    averagePrice: Float
  }

  type InventoryMovement {
    id: ID!
    combinationId: Int
    combination: ProductCombination
    costPerUnit: Float
    quantity: Int
    referenceId: Int
    referenceType: String
    totalCost: Float
    type: String!
    user: User
    createdAt: Date
    updatedAt: Date
  }

  type PaginatedInventoryMovements {
    data: [InventoryMovement]
    meta: PaginationMeta
    summary: JSON
  }

  type PriceHistory {
    id: ID!
    combinationId: Int
    combinations: ProductCombination
    productId: Int
    user: User
    toPrice: Float
    fromPrice: Float
    changedAt: Date
  }

  type PaginatedPriceHistory {
    data: [PriceHistory]
    meta: PaginationMeta
  }

  type Report {
    data: JSON
  }

  type StockAdjustment {
    id: ID
    type: String
    difference: Float
    newQuantity: Int
    notes: String
    reason: String
    referenceNo: String
    systemQuantity: Float
    createdAt: Date
    combination: ProductCombination
    user: User
  }

  type StockAdjustments {
    data: [StockAdjustment]
    meta: PaginationMeta
  }

  type BreakPack {
    id: ID!
    fromCombinationId: Int
    toCombinationId: Int
    quantity: Int
    fromCombination: ProductCombination
    toCombination: ProductCombination
    user: User
    createdAt: Date
  }

  type Query {
    me: User
    users: [User]
    user(id: ID!): User

    categories: [Category]
    category(id: ID!): Category

    products: [Product]
    product(id: ID!): Product

    customers: [Customer]
    customer(id: ID!): Customer

    suppliers(
      limit: Int
      page: Int
      q: String
      sort: String
      order: String
      view: String
    ): Suppliers

    supplier(id: ID!): Supplier
    supplierProducts(productId: ID!): [GoodReceiptLine]

    inventoryMovements(
      ids: [ID!]
      q: String
      type: String
      sort: String
      startDate: String
      endDate: String
      limit: Int
      page: Int
    ): PaginatedInventoryMovements

    breakPacks(q: String, limit: Int, page: Int): [BreakPack]

    salesOrders(
      limit: Int
      page: Int
      q: String
      startDate: String
      endDate: String
      status: String
      sort: String
      order: String
    ): PaginatedSalesOrders

    salesOrder(id: ID): SalesOrder

    invoices(
      limit: Int
      page: Int
      q: String
      startDate: String
      endDate: String
      status: String
      sort: String
      order: String
    ): PaginatedInvoices

    invoice(id: ID): Invoice

    payments(
      limit: Int
      page: Int
      q: String
      startDate: String
      endDate: String
      status: String
      sort: String
      order: String
    ): PaginatedPayments

    goodReceipt(id: ID!): GoodReceipt
    goodReceipts(
      supplierId: Int
      limit: Int
      page: Int
      q: String
      startDate: String
      endDate: String
      status: String
      sort: String
      order: String
    ): PaginatedGoodReceipts

    variantTypes: [VariantType]
    productCombinations: [ProductCombination]
    productCombinationsByIds(ids: [ID!]!): [ProductCombination]
    productCombinationsByCategories(categoryId: Int): [ProductCombination]
    searchProductCombinations(search: String, limit: Int): JSON

    # Reports
    priceHistory(
      limit: Int
      order: String
      page: Int
      q: String
      sort: String
      productId: String
    ): PaginatedPriceHistory

    salesReport(startDate: String, endDate: String): Report

    stockAdjustments(limit: Int, page: Int): StockAdjustments
  }

  type Mutation {
    login(username: String!, password: String!): TokenPayload!
    refreshTokens: TokenPayload!
    logout: Boolean

    # Users
    createUser(input: JSON): User
    updateUser(id: ID!, input: JSON): User
    deleteUser(id: ID!): Boolean

    # Categories
    createCategory(input: JSON): Category
    updateCategory(id: ID!, input: JSON): Category
    deleteCategory(id: ID!): Boolean

    # Products
    createProduct(input: JSON): Product
    updateProduct(id: ID!, input: JSON): Product
    deleteProduct(id: ID!): Boolean

    # More mutations can be defined...
    createCustomer(input: JSON): Customer
    updateCustomer(id: ID!, input: JSON): Customer
    deleteCustomer(id: ID!): Boolean

    createSupplier(input: JSON): Supplier
    updateSupplier(id: ID!, input: JSON): Supplier
    deleteSupplier(id: ID!): Boolean

    createSalesOrder(input: JSON): SalesOrder
    updateSalesOrder(id: ID!, input: JSON): SalesOrder
    deleteSalesOrder(id: ID!): Boolean
    cancelSalesOrder(id: ID!, input: JSON): Boolean
    returnSalesOrder(id: ID!, input: JSON): JSON

    createInvoice(input: JSON): Invoice
    updateInvoice(id: ID!, input: JSON): Invoice
    deleteInvoice(id: ID!): Boolean

    createPayment(input: JSON): Payment
    updatePayment(id: ID!, input: JSON): Payment
    deletePayment(id: ID!): Boolean

    createGoodReceipt(input: JSON): GoodReceipt
    updateGoodReceipt(id: ID!, input: JSON): GoodReceipt
    deleteGoodReceipt(id: ID!): Boolean

    createVariantType(input: JSON): VariantType
    updateVariantType(id: ID!, input: JSON): VariantType
    deleteVariantType(id: ID!): Boolean

    createProductCombination(input: JSON): ProductCombination
    updateProductCombination(id: ID!, input: JSON): ProductCombination
    deleteProductCombination(id: ID!): Boolean
    updatePrices(input: JSON): Boolean
  }
`;

module.exports = typeDefs;
