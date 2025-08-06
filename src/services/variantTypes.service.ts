import db, { sequelize } from "../models/index.js";
import { variantTypesSchema } from "../schemas.js";
import ApiError from "./ApiError";

const { VariantType, VariantValue } = db;

const variantTypesServices = {
  create: async (payload) => {
    const { error } = variantTypesSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }
    const transaction = await sequelize.transaction();
    try {
      const result = await VariantType.create(payload, { transaction });
      for (const value of payload.values) {
        await VariantValue.create(
          {
            value: value.value,
            variantTypeId: result.id,
          },
          { transaction }
        );
      }

      transaction.commit();
      return result;
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  },
  getByProductId: async (id) => {
    try {
      const variantTypes = await VariantType.findAll({
        include: [{ model: VariantValue, as: "values" }],
        order: [["id", "ASC"]],

        where: { productId: id },
        nested: true,
      });
      if (!variantTypes) {
        throw new Error("VariantType not found");
      }
      return variantTypes;
    } catch (error) {
      throw error;
    }
  },
  update: async (id, payload) => {
    const { id: _id, values, ...params } = payload;
    const { error } = variantTypesSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }

    try {
      const variantTypes = await VariantType.findByPk(id);
      if (!variantTypes) {
        throw new Error("VariantType not found");
      }
      const transaction = await sequelize.transaction();

      try {
        await variantTypes.update(params, { transaction });

        const existingVariantValues = await VariantValue.findAll({
          where: { variantTypeId: variantTypes.id },
          transaction,
        });
        const deleteIds = existingVariantValues
          .map((i) => i.id)
          .filter((item) => !values.map((i) => i.id).includes(item));

        await VariantValue.destroy({
          where: { id: deleteIds },
          transaction,
        });

        for (const value of values) {
          if (value?.id) {
            const variantValue = await VariantValue.findByPk(value.id);
            await variantValue.update({ value: value.value }, { transaction });
          } else {
            await VariantValue.create(
              { variantTypeId: variantTypes.id, value: value.value },
              { transaction }
            );
          }
        }
        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        throw err;
      }

      return;
    } catch (error) {
      throw error;
    }
  },
  delete: async (id) => {
    const variantTypes = await VariantType.findByPk(id);
    if (!variantTypes) {
      throw new Error("VariantType not found");
    }
    return variantTypes.destroy();
  },
};

export default variantTypesServices;
