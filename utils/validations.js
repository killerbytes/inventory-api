const Joi = require("joi");

const userBaseSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  isActive: Joi.boolean().default(true),
}).required();

const userSchema = userBaseSchema
  .keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
      }),
  })
  .required();

const loginSchema = Joi.object({
  password: Joi.string().required(),
  username: Joi.string().required(),
}).required();

const supplierSchema = Joi.object({
  name: Joi.string().required(),
  contact: Joi.string().optional().allow(null),
  email: Joi.string().email().allow(null),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  notes: Joi.string().optional(),
  isActive: Joi.boolean().default(true),
}).required();

const customerSchema = supplierSchema;

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow(null),
  categoryId: Joi.number().required(),
  reorderLevel: Joi.number().optional(),
}).required();

const categorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
}).required();

const purchaseOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "COMPLETED", "CANCELLED")
    .default("PENDING"),
}).required();

const purchaseOrderItemSchema = purchaseOrderStatusSchema
  .keys({
    productId: Joi.number().required(),
    quantity: Joi.number().required(),
    unitPrice: Joi.number().required(),
    discount: Joi.number().optional().allow(null),
    product: Joi.object().strip(),
  })
  .required();

const purchaseOrderSchema = Joi.object({
  supplierId: Joi.number().required(),
  orderDate: Joi.date().required(),
  deliveryDate: Joi.date().required(),
  receivedDate: Joi.date().optional(),
  notes: Joi.string().optional().allow(null),
  purchaseOrderItems: Joi.array()
    .items(purchaseOrderItemSchema)
    .required()
    .messages({
      "array.includesRequiredUnknowns":
        "Purchase order must include at least one product.",
    }),
}).required();

const salesOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "COMPLETED", "CANCELLED")
    .default("COMPLETED"),
}).required();

const salesOrderItemSchema = salesOrderStatusSchema
  .keys({
    inventoryId: Joi.number().required(),
    quantity: Joi.number().required(),
    unitPrice: Joi.number().required(),
    discount: Joi.number().optional().allow(null),
    inventory: Joi.object(),
  })
  .required();

const salesOrderSchema = Joi.object({
  customer: Joi.string().required(),
  orderDate: Joi.date().required(),
  deliveryDate: Joi.date().required(),
  receivedDate: Joi.date().optional(),
  notes: Joi.string().optional().allow(null),
  salesOrderItems: Joi.array().items(salesOrderItemSchema).required().messages({
    "array.includesRequiredUnknowns":
      "Purchase order must include at least one product.",
  }),
}).required();

const inventorySchema = Joi.object({
  productId: Joi.number().required(),
  quantity: Joi.number().required(),
}).required();

module.exports = {
  userBaseSchema,
  userSchema,
  loginSchema,
  supplierSchema,
  customerSchema,
  productSchema,
  categorySchema,
  purchaseOrderSchema,
  purchaseOrderItemSchema,
  purchaseOrderStatusSchema,
  salesOrderSchema,
  salesOrderItemSchema,
  salesOrderStatusSchema,
  inventorySchema,
};
