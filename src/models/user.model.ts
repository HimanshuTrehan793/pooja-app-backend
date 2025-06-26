import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
  DataTypes,
} from "sequelize";
import { CartItem } from "./cart.model";
import { Address } from "./address.model";

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare phone_number: string;
  declare first_name: CreationOptional<string>;
  declare last_name: CreationOptional<string>;
  declare gender: CreationOptional<string>;
  declare email: CreationOptional<string>;
  declare refresh_token: CreationOptional<string | null>;
  declare role: CreationOptional<"user" | "admin">;

  static initModel(sequelize: Sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        phone_number: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            is: /^\+[1-9]\d{1,14}$/,
          },
        },
        first_name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        last_name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        gender: {
          type: DataTypes.ENUM("male", "female", "other"),
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
            isEmail: true,
          },
        },
        refresh_token: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        role: {
          type: DataTypes.ENUM("user", "admin"),
          allowNull: false,
          defaultValue: "user",
        },
      },
      {
        sequelize,
        tableName: "users",
        timestamps: true,
        underscored: true,
        paranoid: true,
        indexes: [{ fields: ["phone_number"] }, { fields: ["email"] }],
      }
    );
  }

  static associate() {
    User.hasMany(CartItem, {
      foreignKey: "user_id",
      as: "cart_items",
      onDelete: "CASCADE",
    });

    User.hasMany(Address, {
      foreignKey: "user_id",
      as: "addresses",
      onDelete: "CASCADE",
    });
  }
}
