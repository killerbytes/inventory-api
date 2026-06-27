const authService = require("../../services/auth.service");
const userService = require("../../services/user.service");
const categoryService = require("../../services/category.service");
const productService = require("../../services/product.service");
const customerService = require("../../services/customer.service");
const supplierService = require("../../services/supplier.service");
const salesOrderService = require("../../services/salesOrder.service");
const inventoryService = require("../../services/inventory.service");
const invoiceService = require("../../services/invoice.service");
const paymentService = require("../../services/payment.service");
const goodReceiptService = require("../../services/goodReceipt.service");
const productCombinationService = require("../../services/productCombination.service");
const variantTypesService = require("../../services/variantType.service");
const { GraphQLJSON } = require("graphql-type-json");

const { requireAuth, requirePermission } = require("../auth");
const { PERMISSIONS } = require("../../config/roles");

const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    me: requireAuth(async (_, __, context) => {
      return await authService.getCurrent(context.user);
    }),

    users: requirePermission(
      PERMISSIONS.MANAGE_USERS,
      async () => await userService.list(),
    ),
    user: requirePermission(
      PERMISSIONS.MANAGE_USERS,
      async (_, { id }) => await userService.get(id),
    ),

    categories: requirePermission(
      PERMISSIONS.READ_CATEGORIES,
      async () => await categoryService.list(),
    ),
    category: requirePermission(
      PERMISSIONS.READ_CATEGORIES,
      async (_, { id }) => await categoryService.get(id),
    ),

    products: requirePermission(
      PERMISSIONS.READ_PRODUCTS,
      async () => await productService.list(),
    ),
    product: requirePermission(
      PERMISSIONS.READ_PRODUCTS,
      async (_, { id }) => await productService.get(id),
    ),

    customers: requirePermission(
      PERMISSIONS.READ_CUSTOMERS,
      async () => await customerService.list(),
    ),
    customer: requirePermission(
      PERMISSIONS.READ_CUSTOMERS,
      async (_, { id }) => await customerService.get(id),
    ),

    suppliers: requirePermission(
      PERMISSIONS.READ_SUPPLIERS,
      async (_, args) => {
        const res = await supplierService.list({
          ...args,
        });
        return res;
      },
    ),
    supplier: requirePermission(
      PERMISSIONS.READ_SUPPLIERS,
      async (_, { id }) => await supplierService.get(id),
    ),
    supplierProducts: requirePermission(
      PERMISSIONS.READ_SUPPLIERS,
      async (_, { productId }) =>
        await supplierService.getByProductId(productId),
    ),

    productCombinationsByCategories: requirePermission(
      PERMISSIONS.READ_PRODUCTS,
      async (_, { categoryId }) => {
        return await productCombinationService.getByCategoryId(categoryId);
      },
    ),

    breakPacks: requirePermission(
      PERMISSIONS.MANAGE_INVENTORY,
      async (_, args) => {
        const res = await inventoryService.getBreakPacks(args);
        return res.data;
      },
    ),
    inventoryMovements: requirePermission(
      PERMISSIONS.MANAGE_INVENTORY,
      async (_, args) => await inventoryService.getMovements(args),
    ),

    salesOrders: requirePermission(
      PERMISSIONS.MANAGE_SALES,
      async (_, args) =>
        await salesOrderService.getPaginated({ limit: 1000, ...args }),
    ),

    salesOrder: requirePermission(
      PERMISSIONS.MANAGE_SALES,
      async (_, { id }) => await salesOrderService.get(id),
    ),

    invoices: requirePermission(
      PERMISSIONS.MANAGE_INVOICES,
      async (_, args) =>
        await invoiceService.getPaginated({
          limit: 1000,
          ...args,
        }),
    ),
    invoice: requirePermission(
      PERMISSIONS.MANAGE_INVOICES,
      async (_, { id }) => await invoiceService.get(id),
    ),

    payments: requirePermission(
      PERMISSIONS.MANAGE_PAYMENTS,
      async (_, args) =>
        await paymentService.getPaginated({
          limit: 1000,
          ...args,
        }),
    ),

    goodReceipt: requirePermission(
      PERMISSIONS.MANAGE_RECEIPTS,
      async (_, { id }) => await goodReceiptService.get(id),
    ),

    goodReceipts: requirePermission(
      PERMISSIONS.MANAGE_RECEIPTS,
      async (_, args) =>
        await goodReceiptService.getPaginated({
          ...args,
        }),
    ),
    productCombinations: requirePermission(
      PERMISSIONS.READ_PRODUCTS,
      async () => await productCombinationService.getAllProductCombinations(),
    ),
    productCombinationsByIds: requirePermission(
      PERMISSIONS.READ_PRODUCTS,
      async (_, { ids }) => await productCombinationService.getByIds(ids),
    ),
    searchProductCombinations: requirePermission(
      PERMISSIONS.READ_PRODUCTS,
      async (_, args) => await productCombinationService.search(args),
    ),

    priceHistory: requirePermission(
      PERMISSIONS.MANAGE_INVENTORY,
      async (_, args) => await inventoryService.getPriceHistory(args),
    ),

    stockAdjustments: requirePermission(
      PERMISSIONS.MANAGE_INVENTORY,
      async (_, args) => await inventoryService.getStockAdjustments(args),
    ),
  },

  Mutation: {
    login: async (_, { username, password }, { res }) => {
      const tokens = await authService.login(username, password);
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
        path: "/",
      });
      return { accessToken: tokens.accessToken };
    },
    refreshTokens: async (_, __, { req, res }) => {
      const tokens = await authService.refreshAuth(req.cookies?.refreshToken);
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
        path: "/",
      });
      return { accessToken: tokens.accessToken };
    },
    logout: async (_, __, { req, res }) => {
      await authService.logout(req.cookies?.refreshToken);
      res.clearCookie("refreshToken");
      return true;
    },

    createUser: requirePermission(
      PERMISSIONS.MANAGE_USERS,
      async (_, { input }, context) => await userService.create(input),
    ),
    updateUser: requirePermission(
      PERMISSIONS.MANAGE_USERS,
      async (_, { id, input }, context) => await userService.update(id, input),
    ),
    deleteUser: requirePermission(
      PERMISSIONS.MANAGE_USERS,
      async (_, { id }, context) => {
        await userService.delete(id);
        return true;
      },
    ),

    createCategory: requirePermission(
      PERMISSIONS.WRITE_CATEGORIES,
      async (_, { input }) => await categoryService.create(input),
    ),
    updateCategory: requirePermission(
      PERMISSIONS.WRITE_CATEGORIES,
      async (_, { id, input }) => await categoryService.update(id, input),
    ),
    deleteCategory: requirePermission(
      PERMISSIONS.WRITE_CATEGORIES,
      async (_, { id }) => {
        await categoryService.delete(id);
        return true;
      },
    ),

    createProduct: requirePermission(
      PERMISSIONS.WRITE_PRODUCTS,
      async (_, { input }) => await productService.create(input),
    ),
    updateProduct: requirePermission(
      PERMISSIONS.WRITE_PRODUCTS,
      async (_, { id, input }) => await productService.update(id, input),
    ),
    deleteProduct: requirePermission(
      PERMISSIONS.WRITE_PRODUCTS,
      async (_, { id }) => {
        await productService.delete(id);
        return true;
      },
    ),

    createCustomer: requirePermission(
      PERMISSIONS.WRITE_CUSTOMERS,
      async (_, { input }) => await customerService.create(input),
    ),
    updateCustomer: requirePermission(
      PERMISSIONS.WRITE_CUSTOMERS,
      async (_, { id, input }) => await customerService.update(id, input),
    ),
    deleteCustomer: requirePermission(
      PERMISSIONS.WRITE_CUSTOMERS,
      async (_, { id }) => {
        await customerService.delete(id);
        return true;
      },
    ),

    createSupplier: requirePermission(
      PERMISSIONS.WRITE_SUPPLIERS,
      async (_, { input }) => await supplierService.create(input),
    ),
    updateSupplier: requirePermission(
      PERMISSIONS.WRITE_SUPPLIERS,
      async (_, { id, input }) => await supplierService.update(id, input),
    ),
    deleteSupplier: requirePermission(
      PERMISSIONS.WRITE_SUPPLIERS,
      async (_, { id }) => {
        await supplierService.delete(id);
        return true;
      },
    ),

    createSalesOrder: requirePermission(
      PERMISSIONS.MANAGE_SALES,
      async (_, { input }, context) =>
        await salesOrderService.create(input, context.user),
    ),
    updateSalesOrder: requirePermission(
      PERMISSIONS.MANAGE_SALES,
      async (_, { id, input }, context) =>
        await salesOrderService.update(id, input, context.user),
    ),
    deleteSalesOrder: requirePermission(
      PERMISSIONS.MANAGE_SALES,
      async (_, { id }) => {
        await salesOrderService.delete(id);
        return true;
      },
    ),
    cancelSalesOrder: requirePermission(
      PERMISSIONS.MANAGE_SALES,
      async (_, { id, input }) => {
        await salesOrderService.cancelOrder(id, input);
        return true;
      },
    ),
    returnSalesOrder: requirePermission(
      PERMISSIONS.MANAGE_SALES,
      async (_, { id, input }) => {
        return await salesOrderService.returnExchange(
          id,
          input?.returns,
          input?.exchanges,
          input?.reason,
        );
      },
    ),

    createInvoice: requirePermission(
      PERMISSIONS.MANAGE_INVOICES,
      async (_, { input }, context) => await invoiceService.create(input),
    ),
    updateInvoice: requirePermission(
      PERMISSIONS.MANAGE_INVOICES,
      async (_, { id, input }, context) =>
        await invoiceService.update(id, input),
    ),
    deleteInvoice: requirePermission(
      PERMISSIONS.MANAGE_INVOICES,
      async (_, { id }) => {
        await invoiceService.delete(id);
        return true;
      },
    ),

    createPayment: requirePermission(
      PERMISSIONS.MANAGE_PAYMENTS,
      async (_, { input }, context) => await paymentService.create(input),
    ),
    updatePayment: requirePermission(
      PERMISSIONS.MANAGE_PAYMENTS,
      async (_, { id, input }, context) =>
        await paymentService.update(id, input),
    ),
    deletePayment: requirePermission(
      PERMISSIONS.MANAGE_PAYMENTS,
      async (_, { id }) => {
        await paymentService.delete(id);
        return true;
      },
    ),

    createGoodReceipt: requirePermission(
      PERMISSIONS.MANAGE_RECEIPTS,
      async (_, { input }, context) => await goodReceiptService.create(input),
    ),
    updateGoodReceipt: requirePermission(
      PERMISSIONS.MANAGE_RECEIPTS,
      async (_, { id, input }, context) =>
        await goodReceiptService.update(id, input),
    ),
    deleteGoodReceipt: requirePermission(
      PERMISSIONS.MANAGE_RECEIPTS,
      async (_, { id }) => {
        await goodReceiptService.delete(id);
        return true;
      },
    ),

    createVariantType: requirePermission(
      PERMISSIONS.MANAGE_VARIANTS,
      async (_, { input }) => await variantTypesService.create(input),
    ),
    updateVariantType: requirePermission(
      PERMISSIONS.MANAGE_VARIANTS,
      async (_, { id, input }) => await variantTypesService.update(id, input),
    ),
    deleteVariantType: requirePermission(
      PERMISSIONS.MANAGE_VARIANTS,
      async (_, { id }) => {
        await variantTypesService.delete(id);
        return true;
      },
    ),

    createProductCombination: requirePermission(
      PERMISSIONS.WRITE_PRODUCTS,
      async (_, { input }) => await productCombinationService.create(input),
    ),
    updateProductCombination: requirePermission(
      PERMISSIONS.WRITE_PRODUCTS,
      async (_, { id, input }) =>
        await productCombinationService.update(id, input),
    ),
    deleteProductCombination: requirePermission(
      PERMISSIONS.WRITE_PRODUCTS,
      async (_, { id }) => {
        await productCombinationService.delete(id);
        return true;
      },
    ),
    updatePrices: requirePermission(
      PERMISSIONS.WRITE_PRODUCTS,
      async (_, { input }) => {
        await productCombinationService.updatePrices(input);
        return true;
      },
    ),
  },

  GoodReceipt: {
    receiptNumber: (parent) => parent.referenceNo || "",
  },
  SalesOrder: {
    salesOrderHistory: (parent) => parent.salesOrderStatusHistory || [],
  },
};

module.exports = resolvers;
