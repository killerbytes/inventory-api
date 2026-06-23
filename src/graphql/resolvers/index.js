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

const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    me: async (_, __, context) => {
      if (!context.user) {
        const { GraphQLError } = require("graphql");
        throw new GraphQLError("No auth context", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      return await authService.getCurrent(context.user);
    },

    users: async () => await userService.list(),
    user: async (_, { id }) => await userService.get(id),

    categories: async () => await categoryService.list(),
    category: async (_, { id }) => await categoryService.get(id),

    products: async () => await productService.list(),
    product: async (_, { id }) => await productService.get(id),

    customers: async () => await customerService.list(),
    customer: async (_, { id }) => await customerService.get(id),

    suppliers: async (_, args) => {
      const res = await supplierService.getPaginated({
        limit: 1000,
        ...args,
      });
      return res;
    },
    supplier: async (_, { id }) => await supplierService.get(id),
    supplierProducts: async (_, { productId }) =>
      await supplierService.getByProductId(productId),

    inventory: async (_, { productId }) =>
      await inventoryService.getAllInventory(productId),
    breakPacks: async (_, args) => {
      const res = await inventoryService.getBreakPacks(args);
      return res.data;
    },

    salesOrders: async (_, args) =>
      await salesOrderService.getPaginated({ limit: 1000, ...args }),

    salesOrder: async (_, { id }) => await salesOrderService.get(id),

    invoices: async (_, args) =>
      await invoiceService.getPaginated({
        limit: 1000,
        ...args,
      }),
    invoice: async (_, { id }) => await invoiceService.getInvoiceById(id),

    payments: async (_, args) =>
      await paymentService.getPaginated({
        limit: 1000,
        ...args,
      }),

    goodReceipt: async (_, { id }) => await goodReceiptService.get(id),

    goodReceipts: async (_, args) =>
      await goodReceiptService.getPaginated({
        limit: 1000,
        ...args,
      }),
    productCombinations: async () =>
      await productCombinationService.getAllProductCombinations(),
    productCombinationsByIds: async (_, { ids }) =>
      await productCombinationService.getByIds(ids),
    searchProductCombinations: async (_, args) =>
      await productCombinationService.search(args),

    priceHistory: async (_, args) =>
      await inventoryService.getPriceHistory(args),

    stockAdjustments: async (_, args) =>
      await inventoryService.getStockAdjustments(args),
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

    createUser: async (_, { input }, context) =>
      await userService.createUser(input),
    updateUser: async (_, { id, input }, context) =>
      await userService.updateUser(id, input),
    deleteUser: async (_, { id }, context) => {
      await userService.deleteUser(id);
      return true;
    },

    createCategory: async (_, { input }) =>
      await categoryService.createCategory(input),
    updateCategory: async (_, { id, input }) =>
      await categoryService.updateCategory(id, input),
    deleteCategory: async (_, { id }) => {
      await categoryService.deleteCategory(id);
      return true;
    },

    createProduct: async (_, { input }) =>
      await productService.createProduct(input),
    updateProduct: async (_, { id, input }) =>
      await productService.updateProduct(id, input),
    deleteProduct: async (_, { id }) => {
      await productService.deleteProduct(id);
      return true;
    },

    createCustomer: async (_, { input }) =>
      await customerService.createCustomer(input),
    updateCustomer: async (_, { id, input }) =>
      await customerService.updateCustomer(id, input),
    deleteCustomer: async (_, { id }) => {
      await customerService.deleteCustomer(id);
      return true;
    },

    createSupplier: async (_, { input }) =>
      await supplierService.createSupplier(input),
    updateSupplier: async (_, { id, input }) =>
      await supplierService.updateSupplier(id, input),
    deleteSupplier: async (_, { id }) => {
      await supplierService.deleteSupplier(id);
      return true;
    },

    createSalesOrder: async (_, { input }, context) =>
      await salesOrderService.createSalesOrder(input, context.user),
    updateSalesOrder: async (_, { id, input }, context) =>
      await salesOrderService.updateSalesOrder(id, input, context.user),
    deleteSalesOrder: async (_, { id }) => {
      await salesOrderService.deleteSalesOrder(id);
      return true;
    },
    cancelSalesOrder: async (_, { id, input }) => {
      await salesOrderService.cancelOrder(id, input);
      return true;
    },
    returnSalesOrder: async (_, { id, input }) => {
      return await salesOrderService.returnExchange(
        id,
        input?.returns,
        input?.exchanges,
        input?.reason,
      );
    },

    createInvoice: async (_, { input }, context) =>
      await invoiceService.createInvoice(input),
    updateInvoice: async (_, { id, input }, context) =>
      await invoiceService.updateInvoice(id, input),
    deleteInvoice: async (_, { id }) => {
      await invoiceService.deleteInvoice(id);
      return true;
    },

    createPayment: async (_, { input }, context) =>
      await paymentService.createPayment(input),
    updatePayment: async (_, { id, input }, context) =>
      await paymentService.updatePayment(id, input),
    deletePayment: async (_, { id }) => {
      await paymentService.deletePayment(id);
      return true;
    },

    createGoodReceipt: async (_, { input }, context) =>
      await goodReceiptService.createGoodReceipt(input),
    updateGoodReceipt: async (_, { id, input }, context) =>
      await goodReceiptService.updateGoodReceipt(id, input),
    deleteGoodReceipt: async (_, { id }) => {
      await goodReceiptService.deleteGoodReceipt(id);
      return true;
    },

    createVariantType: async (_, { input }) =>
      await variantTypesService.createVariantType(input),
    updateVariantType: async (_, { id, input }) =>
      await variantTypesService.updateVariantType(id, input),
    deleteVariantType: async (_, { id }) => {
      await variantTypesService.deleteVariantType(id);
      return true;
    },

    createProductCombination: async (_, { input }) =>
      await productCombinationService.createProductCombination(input),
    updateProductCombination: async (_, { id, input }) =>
      await productCombinationService.updateProductCombination(id, input),
    deleteProductCombination: async (_, { id }) => {
      await productCombinationService.deleteProductCombination(id);
      return true;
    },
    updatePrices: async (_, { input }) => {
      await productCombinationService.updatePrices(input);
      return true;
    },
  },

  GoodReceipt: {
    receiptNumber: (parent) => parent.referenceNo || "",
  },
};

module.exports = resolvers;
