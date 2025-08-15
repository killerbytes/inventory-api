const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

class User extends Model {
  static associate(models) {}
  static generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  }

  static validatePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }
}

module.exports = (sequelize) => {
  User.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      username: { type: DataTypes.STRING, allowNull: false, unique: true },
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: { isEmail: true },
      },
      password: { type: DataTypes.STRING, allowNull: false },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
      isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: "User",
      defaultScope: {
        attributes: {
          exclude: ["password", "createdAt", "updatedAt", "email"],
        }, // Exclude password by default
      },
      scopes: {
        withPassword: {
          attributes: { include: ["password"] }, // Include when specifically needed
        },
      },
      paranoid: true, // Enable soft deletes
      deletedAt: "deletedAt", // Specify the name of the deletedAt column
      timestamps: true, // Enable createdAt and updatedAt
    }
  );

  return User;
};
