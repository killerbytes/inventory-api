const { Model } = require("sequelize");
const { ORDER_STATUS, MODE_OF_PAYMENT } = require("../definitions");
const { format } = require("date-fns");
const getNextSequence = require("../utils/services/getNextSequence");

module.exports = (sequelize, DataTypes) => {
  class GoodReceipt extends Model {
    static associate(models) {
      GoodReceipt.belongsTo(models.Supplier, {
        foreignKey: "supplierId",
        as: "supplier",
      });
      GoodReceipt.hasMany(models.GoodReceiptLine, {
        foreignKey: "goodReceiptId",
        as: "goodReceiptLines",
      });
      GoodReceipt.hasMany(models.OrderStatusHistory, {
        foreignKey: "goodReceiptId",
        as: "goodReceiptStatusHistory",
      });
    }
  }

  GoodReceipt.init(
    {
      supplierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: ORDER_STATUS.DRAFT,
        validate: {
          isIn: [Object.values(ORDER_STATUS)],
        },
      },
      receiptDate: DataTypes.DATE,
      cancellationReason: DataTypes.TEXT,
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      referenceNo: DataTypes.TEXT,
      internalNotes: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "GoodReceipt",
      defaultScope: {
        attributes: { exclude: ["updatedAt"] },
      },
      paranoid: true,
      deletedAt: "deletedAt",
    }
  );

  GoodReceipt.beforeCreate(async (order, options) => {
    // const sequelize = order.sequelize || options.sequelize; // ensure sequelize ref
    // const now = new Date();
    // const yearMonth = format(now, "yyyy-MM"); // e.g. 2025-08
    // const nextval = await getNextSequence("purchase_order_seq", sequelize);
    // order.purchaseOrderNumber = `PO-${yearMonth}-${String(nextval).padStart(
    //   4,
    //   "0"
    // )}`;
  });

  return GoodReceipt;
};
