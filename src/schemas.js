const Joi = require("joi");
const { INVENTORY_MOVEMENT_TYPE, INVOICE_STATUS } = require("./definitions");

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
  isBreakpackFilter: Joi.boolean().optional().allow(null),
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
  isBreakPack: Joi.boolean().default(false).allow(null),
  isActive: Joi.boolean().default(true).allow(null),
  isBreakPackOfId: Joi.number().optional().allow(null),
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

const goodReceiptChangeStatusSchema = Joi.object({
  status: Joi.string().valid("VOID"),
})
  .required()
  .meta({ className: "goodReceiptChangeStatus" });

const goodReceiptStatusSchema = Joi.object({
  status: Joi.string()
    .valid("DRAFT", "RECEIVED", "COMPLETED", "CANCELLED")
    .default("DRAFT"),
  cancellationReason: Joi.string().optional().allow(null).when("status", {
    is: "CANCELLED",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
})
  .required()
  .meta({ className: "goodReceiptStatus" });

const goodReceiptLineSchema = goodReceiptStatusSchema
  .keys({
    id: Joi.number().optional(),
    combinationId: Joi.number().required(),
    quantity: Joi.number().required(),
    purchasePrice: Joi.number().required(),
    discount: Joi.number().optional().allow(null),
    discountNote: Joi.string().optional().allow(null, ""),
    unit: Joi.string(),
    skuSnapshot: Joi.string(),
    nameSnapshot: Joi.string(),
    variantSnapshot: Joi.object(),
  })
  .required()
  .meta({ className: "goodReceiptLine" });

const goodReceiptSchema = Joi.object({
  supplierId: Joi.number().required(),
  receiptDate: Joi.date().required(),
  referenceNo: Joi.string().optional().allow(null, ""),
  internalNotes: Joi.string().optional().allow(null, ""),
  goodReceiptLines: Joi.array().items(goodReceiptLineSchema).required(),
  // .messages({
  //   "array.includesRequiredUnknowns":
  //     "Purchase order must include at least one product.",
  // }),
})
  .required()
  .meta({ className: "goodReceipt" });

const salesOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("DRAFT", "COMPLETED", "CANCELLED")
    .default("DRAFT"),
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

const salesOrderFormSchema = Joi.object({
  customerId: Joi.number().required(),
  orderDate: Joi.date().required(),
  isDelivery: Joi.boolean().optional(),
  deliveryAddress: Joi.string().allow(null, "").when("isDelivery", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  deliveryInstructions: Joi.string().optional().allow(null, ""),
  deliveryDate: Joi.date().allow(null, "").when("isDelivery", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  notes: Joi.string().optional().allow(null, ""),
  internalNotes: Joi.string().optional().allow(null, ""),
  modeOfPayment: Joi.string().required(),
  salesOrderItems: Joi.array().items(salesOrderItemSchema).allow(null, ""),
}).options({
  stripUnknown: true,
});

const salesOrderSchema = Joi.object({
  salesOrderNumber: Joi.string().optional(),
  customerId: Joi.number().required(),
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
  modeOfPayment: Joi.string().required(),
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
}).meta({ className: "breakPack" });

const rePackSchema = breakPackSchema.meta({ className: "rePack" });

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

const invoiceLineSchema = Joi.object({
  amount: Joi.number().required(),
  goodReceiptId: Joi.number().required(),
}).meta({ className: "invoiceLine" });

const invoiceSchemaCreate = Joi.object({
  invoiceLines: Joi.array().items(invoiceLineSchema).allow(null, ""),
  invoiceDate: Joi.date().required(),
}).options({
  stripUnknown: true,
});
const invoiceSchema = Joi.object({
  invoiceNumber: Joi.string().optional(),
  invoiceDate: Joi.date().required(),
  dueDate: Joi.date().required(),
  status: Joi.string()
    .valid(...Object.values(INVOICE_STATUS))
    .required(),
  totalAmount: Joi.number().required(),
  notes: Joi.string().optional().allow(null, ""),
  invoiceLines: Joi.array().items(invoiceLineSchema).required(),
})
  .options({
    stripUnknown: true,
  })
  .meta({ className: "invoice" });

const paymentApplicationSchema = Joi.object({
  id: Joi.number().optional(),
  amountApplied: Joi.number().required(),
  invoiceId: Joi.number().required(),
});
const paymentSchema = Joi.object({
  supplierId: Joi.number().required(),
  paymentDate: Joi.date().required(),
  referenceNo: Joi.string().optional().allow(null, ""),
  amount: Joi.number().required(),
  notes: Joi.string().optional().allow(null, ""),
  changedBy: Joi.number().optional().allow(null, ""),
  applications: Joi.array().items(paymentApplicationSchema).required(),
});

const returnItemSchema = Joi.object({
  combinationId: Joi.number().required(),
  quantity: Joi.number().required(),
});
const returnSchema = Joi.object({
  id: Joi.number().optional(),
  referenceId: Joi.number().required(),
  returns: Joi.array().items(returnItemSchema).required(),
  exchanges: Joi.array().items(returnItemSchema).optional(),
  reason: Joi.string().required(),
});

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
  goodReceiptChangeStatusSchema,
  goodReceiptStatusSchema,
  goodReceiptLineSchema,
  goodReceiptSchema,
  salesOrderStatusSchema,
  salesOrderItemSchema,
  salesOrderSchema,
  salesOrderFormSchema,
  inventoryMovementSchema,
  inventoryPriceAdjustmentSchema,
  breakPackSchema,
  rePackSchema,
  stockAdjustmentSchema,
  invoiceLineSchema,
  invoiceSchema,
  invoiceSchemaCreate,
  paymentSchema,
  returnSchema,
};
