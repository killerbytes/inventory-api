const Joi = require("joi");
const { INVENTORY_MOVEMENT_TYPE } = require("./definitions");

const userBaseSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  isActive: Joi.boolean().default(true),
})
  .required()
  .meta({ className: "userBase" });

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
})
  .required()
  .meta({ className: "login" });

const supplierSchema = Joi.object({
  name: Joi.string().required(),
  contact: Joi.string().optional().allow(null),
  email: Joi.string().email().allow(null),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  notes: Joi.string().optional(),
  isActive: Joi.boolean().default(true),
})
  .required()
  .meta({ className: "supplier" });

const customerSchema = supplierSchema.meta({ className: "customer" });

const variantValueSchema = Joi.object({
  id: Joi.number().optional(),
  value: Joi.string().required(),
  variantTypeId: Joi.number().optional(),
}).meta({ className: "variantValue" });

const variantValuePayloadSchema = Joi.string()
  .required()
  .meta({ className: "variantValuePayload" });

const variantTypesSchema = Joi.object({
  id: Joi.number().optional(),
  name: Joi.string().required(),
  isTemplate: Joi.boolean().optional().allow(null),
  values: Joi.array()
    .items(
      Joi.alternatives().try(variantValueSchema, variantValuePayloadSchema)
    )
    .required(),
  productId: Joi.number().optional(),
})
  .required()
  .meta({ className: "variant" });

const inventorySchema = Joi.object({
  id: Joi.number().optional(),
  productId: Joi.number().required(),
  quantity: Joi.number().required(),
})
  .required()
  .meta({ className: "inventory" });

const productCombinationSchema = Joi.object({
  id: Joi.number().optional(),
  productId: Joi.number(),
  sku: Joi.string().allow(null),
  unit: Joi.string().required(),
  conversionFactor: Joi.number().required(),
  price: Joi.number().required(),
  reorderLevel: Joi.number().required(),
  values: Joi.alternatives().try(
    Joi.array().items(variantValueSchema).required()
    // Joi.object()
  ),
})
  .options({
    stripUnknown: true,
  })
  .meta({ className: "productCombinations" });

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow(null),
  baseUnit: Joi.string().required(),
  categoryId: Joi.number().required(),
  variants: Joi.array().items(variantTypesSchema).optional(),
  combinations: Joi.array().items(productCombinationSchema).optional(),
})
  .required()
  .options({
    stripUnknown: true,
  })
  .meta({ className: "product" });

const categorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow(null).allow(""),
  parentId: Joi.number().optional(),
})
  .required()
  .meta({ className: "category" });

const purchaseOrderChangeStatusSchema = Joi.object({
  status: Joi.string().valid("VOID"),
})
  .required()
  .meta({ className: "purchaseOrderChangeStatus" });

const purchaseOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "RECEIVED", "COMPLETED", "CANCELLED")
    .default("PENDING"),
  cancellationReason: Joi.string().optional().allow(null).when("status", {
    is: "CANCELLED",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
})
  .required()
  .meta({ className: "purchaseOrderStatus" });

const purchaseOrderItemSchema = purchaseOrderStatusSchema
  .keys({
    id: Joi.number().optional(),
    combinationId: Joi.number().required(),
    quantity: Joi.number().required(),
    originalPrice: Joi.number().optional().allow(null),
    purchasePrice: Joi.number().required(),
    discount: Joi.number().optional().allow(null),
    discountNote: Joi.string().optional().allow(null, ""),
    unit: Joi.string(),
    skuSnapshot: Joi.string(),
    nameSnapshot: Joi.string(),
    variantSnapshot: Joi.object(),
  })
  .required()
  .meta({ className: "purchaseOrderItem" });

const purchaseOrderSchema = Joi.object({
  purchaseOrderNumber: Joi.string().required(),
  supplierId: Joi.number().required(),
  deliveryDate: Joi.date().required(),
  notes: Joi.string().optional().allow(null, ""),
  internalNotes: Joi.string().optional().allow(null, ""),
  modeOfPayment: Joi.string().required(),
  checkNumber: Joi.string().allow(null).when("modeOfPayment", {
    is: "CHECK",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  dueDate: Joi.date().when("modeOfPayment", {
    is: "CHECK",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  purchaseOrderItems: Joi.array()
    .items(purchaseOrderItemSchema)
    .required()
    .messages({
      "array.includesRequiredUnknowns":
        "Purchase order must include at least one product.",
    }),
})
  .required()
  .meta({ className: "purchaseOrder" });

const purchaseOrderUpdateSchema = Joi.object({
  purchaseOrderNumber: Joi.string().required(),
  supplierId: Joi.number().required(),
  deliveryDate: Joi.date().required(),
  internalNotes: Joi.string().optional().allow(null),
  notes: Joi.string().optional().allow(null),
  modeOfPayment: Joi.string().required(),
  checkNumber: Joi.string().allow(null).when("modeOfPayment", {
    is: "CHECK",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  dueDate: Joi.date().when("modeOfPayment", {
    is: "CHECK",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  purchaseOrderItems: Joi.array()
    .items(purchaseOrderItemSchema)
    .required()
    .messages({
      "array.includesRequiredUnknowns":
        "Purchase order must include at least one product.",
    }),
})
  .required()
  .meta({ className: "purchaseOrderUpdate" });

const salesOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "COMPLETED", "CANCELLED")
    .default("COMPLETED"),
})
  .required()
  .meta({ className: "salesOrderStatus" });

const salesOrderItemSchema = salesOrderStatusSchema
  .keys({
    id: Joi.number().optional(),
    combinationId: Joi.number().required(),
    quantity: Joi.number().required(),
    originalPrice: Joi.number().optional().allow(null),
    purchasePrice: Joi.number().required(),
    discount: Joi.number().optional().allow(null),
    discountNote: Joi.string().optional().allow(null, ""),
    unit: Joi.string(),
    skuSnapshot: Joi.string(),
    nameSnapshot: Joi.string(),
    variantSnapshot: Joi.object(),
  })
  .required()
  .meta({ className: "salesOrderItem" });

const salesOrderSchema = Joi.object({
  salesOrderNumber: Joi.string().required(),
  customerId: Joi.number().required(),
  orderDate: Joi.date().required(),
  isDelivery: Joi.boolean().optional(),
  isDeliveryCompleted: Joi.boolean().optional(),
  deliveryAddress: Joi.string().when("isDelivery", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  deliveryInstructions: Joi.string().optional(),
  deliveryDate: Joi.date().when("isDelivery", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  notes: Joi.string().optional().allow(null, ""),
  internalNotes: Joi.string().optional().allow(null, ""),
  salesOrderItems: Joi.array().items(salesOrderItemSchema).required().messages({
    "array.includesRequiredUnknowns":
      "Purchase order must include at least one product.",
  }),
})
  .required()
  .meta({ className: "salesOrder" });

const inventoryMovementSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(INVENTORY_MOVEMENT_TYPE))
    .required(),
})
  .required()
  .meta({ className: "inventoryMovement" });

const inventoryPriceAdjustmentSchema = Joi.object({
  price: Joi.number().required(),
}).meta({ className: "inventoryPriceAdjustment" });

const breakPackSchema = Joi.object({
  fromCombinationId: Joi.number().required(),
  quantity: Joi.number().required(),
  toCombinationId: Joi.number().required(),
  conversionFactor: Joi.number().required(),
}).meta({ className: "breakPack" });

const stockAdjustmentSchema = Joi.object({
  referenceNo: Joi.string().required(),
  combinationId: Joi.number().required(),
  systemQuantity: Joi.number().required(),
  newQuantity: Joi.number().required(),
  difference: Joi.number().required(),
  reason: Joi.string().required(),
  notes: Joi.string().optional().allow(null, ""),
  createdAt: Joi.date().required(),
  createdBy: Joi.number().required(),
}).meta({ className: "stockAdjustment" });

module.exports = {
  userBaseSchema,
  userSchema,
  loginSchema,
  supplierSchema,
  customerSchema,
  variantValueSchema,
  variantValuePayloadSchema,
  variantTypesSchema,
  inventorySchema,
  productCombinationSchema,
  productSchema,
  categorySchema,
  purchaseOrderChangeStatusSchema,
  purchaseOrderStatusSchema,
  purchaseOrderItemSchema,
  purchaseOrderSchema,
  purchaseOrderUpdateSchema,
  salesOrderStatusSchema,
  salesOrderItemSchema,
  salesOrderSchema,
  inventoryMovementSchema,
  inventoryPriceAdjustmentSchema,
  breakPackSchema,
  stockAdjustmentSchema,
};
