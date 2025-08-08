import Joi from "joi";
import { INVENTORY_MOVEMENT_TYPE } from "./definitions";

export const userBaseSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  isActive: Joi.boolean().default(true),
})
  .required()
  .meta({ className: "userBase" });

export const userSchema = userBaseSchema
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

export const loginSchema = Joi.object({
  password: Joi.string().required(),
  username: Joi.string().required(),
})
  .required()
  .meta({ className: "login" });

export const supplierSchema = Joi.object({
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

export const customerSchema = supplierSchema.meta({ className: "customer" });

export const variantValueSchema = Joi.object({
  id: Joi.number().optional(),
  value: Joi.string().required(),
  variantTypeId: Joi.number().optional(),
}).meta({ className: "variantValue" });

export const variantValuePayloadSchema = Joi.string()
  .required()
  .meta({ className: "variantValuePayload" });

export const variantTypesSchema = Joi.object({
  id: Joi.number().optional(),
  name: Joi.string().required(),
  isTemplate: Joi.boolean().optional(),
  values: Joi.array()
    .items(
      Joi.alternatives().try(variantValueSchema, variantValuePayloadSchema)
    )
    .required(),
  productId: Joi.number().optional(),
})
  .required()
  .meta({ className: "variant" });

export const inventorySchema = Joi.object({
  id: Joi.number().optional(),
  productId: Joi.number().required(),
  quantity: Joi.number().required(),
})
  .required()
  .meta({ className: "inventory" });

export const productCombinationSchema = Joi.object({
  id: Joi.number().optional(),
  productId: Joi.number(),
  sku: Joi.string().allow(null),
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

export const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow(null),
  unit: Joi.string().required(),
  categoryId: Joi.number().required(),
  variants: Joi.array().items(variantTypesSchema).optional(),
  combinations: Joi.array().items(productCombinationSchema).optional(),
})
  .required()
  .options({
    stripUnknown: true,
  })
  .meta({ className: "product" });

export const categorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
})
  .required()
  .meta({ className: "category" });

export const purchaseOrderChangeStatusSchema = Joi.object({
  status: Joi.string().valid("VOID"),
})
  .required()
  .meta({ className: "purchaseOrderChangeStatus" });

export const purchaseOrderStatusSchema = Joi.object({
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

export const purchaseOrderItemSchema = purchaseOrderStatusSchema
  .keys({
    id: Joi.number().optional(),
    combinationId: Joi.number().required(),
    quantity: Joi.number().required(),
    originalPrice: Joi.number().optional().allow(null),
    unitPrice: Joi.number().required(),
    discount: Joi.number().optional().allow(null),
    discountNote: Joi.string().optional().allow(null, ""),
  })
  .required()
  .meta({ className: "purchaseOrderItem" });

export const purchaseOrderSchema = Joi.object({
  purchaseOrderNumber: Joi.string().required(),
  supplierId: Joi.number().required(),
  orderDate: Joi.date().required(),
  deliveryDate: Joi.date().required(),
  receivedDate: Joi.date().optional(),
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

export const purchaseOrderUpdateSchema = Joi.object({
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

export const salesOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "COMPLETED", "CANCELLED")
    .default("COMPLETED"),
})
  .required()
  .meta({ className: "salesOrderStatus" });

export const salesOrderItemSchema = salesOrderStatusSchema
  .keys({
    inventoryId: Joi.number().required(),
    quantity: Joi.number().required(),
    unitPrice: Joi.number().required(),
    originalPrice: Joi.number().allow(null),
    discount: Joi.number().optional().allow(null),
    inventory: Joi.object(),
  })
  .required()
  .meta({ className: "salesOrderItem" });

export const salesOrderSchema = Joi.object({
  customer: Joi.string().required(),
  orderDate: Joi.date().required(),
  deliveryDate: Joi.date().required(),
  receivedDate: Joi.date().optional(),
  notes: Joi.string().optional().allow(null),
  salesOrderItems: Joi.array().items(salesOrderItemSchema).required().messages({
    "array.includesRequiredUnknowns":
      "Purchase order must include at least one product.",
  }),
})
  .required()
  .meta({ className: "salesOrder" });

export const inventoryMovementSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(INVENTORY_MOVEMENT_TYPE))
    .required(),
})
  .required()
  .meta({ className: "inventoryMovement" });

export const inventoryPriceAdjustmentSchema = Joi.object({
  price: Joi.number().required(),
}).meta({ className: "inventoryPriceAdjustment" });

export const repackInventorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow(null),
  categoryId: Joi.number().required(),
  unit: Joi.string().required(),
  price: Joi.number().required(),
  pullOutQuantity: Joi.number().required(),
  repackQuantity: Joi.number().required(),
  parentId: Joi.number().required(),
}).meta({ className: "repackInventory" });
