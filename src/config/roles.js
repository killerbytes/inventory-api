const PERMISSIONS = {
  // Catch-all
  ALL: "*",

  // Users
  MANAGE_USERS: "manage:users",

  // Backup
  MANAGE_BACKUP: "manage:backup",

  // Products
  READ_PRODUCTS: "read:products",
  WRITE_PRODUCTS: "write:products",

  // Categories
  READ_CATEGORIES: "read:categories",
  WRITE_CATEGORIES: "write:categories",

  // Variant Types
  MANAGE_VARIANTS: "manage:variants",

  // Customers
  READ_CUSTOMERS: "read:customers",
  WRITE_CUSTOMERS: "write:customers",

  // Suppliers
  READ_SUPPLIERS: "read:suppliers",
  WRITE_SUPPLIERS: "write:suppliers",

  // Inventory / Stock
  MANAGE_INVENTORY: "manage:inventory",

  // Goods Receipt
  MANAGE_RECEIPTS: "manage:receipts",

  // Sales Orders
  MANAGE_SALES: "manage:sales",

  // Invoices & Payments
  MANAGE_INVOICES: "manage:invoices",
  MANAGE_PAYMENTS: "manage:payments",

  // Reports
  READ_REPORTS: "read:reports",
};

const ROLES = {
  Admin: [PERMISSIONS.ALL],
  Manager: [
    PERMISSIONS.READ_PRODUCTS,
    PERMISSIONS.WRITE_PRODUCTS,
    PERMISSIONS.READ_CATEGORIES,
    PERMISSIONS.WRITE_CATEGORIES,
    PERMISSIONS.MANAGE_VARIANTS,
    PERMISSIONS.READ_CUSTOMERS,
    PERMISSIONS.WRITE_CUSTOMERS,
    PERMISSIONS.READ_SUPPLIERS,
    PERMISSIONS.WRITE_SUPPLIERS,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.MANAGE_RECEIPTS,
    PERMISSIONS.MANAGE_SALES,
    PERMISSIONS.MANAGE_INVOICES,
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.READ_REPORTS,
  ],
  Cashier: [
    PERMISSIONS.READ_PRODUCTS,
    PERMISSIONS.READ_CATEGORIES,
    PERMISSIONS.READ_CUSTOMERS,
    PERMISSIONS.WRITE_CUSTOMERS,
    PERMISSIONS.MANAGE_SALES,
    PERMISSIONS.MANAGE_INVOICES,
    PERMISSIONS.MANAGE_PAYMENTS,
  ],
  User: [
    PERMISSIONS.READ_PRODUCTS,
    PERMISSIONS.READ_CATEGORIES,
  ],
};

module.exports = {
  PERMISSIONS,
  ROLES,
  getRolePermissions: (roleName) => {
    return ROLES[roleName] || [];
  },
};
