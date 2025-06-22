import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
  DataTypes,
  ForeignKey,
} from "sequelize";
import { User } from "./user.model";

export class UserAddress extends Model<
  InferAttributes<UserAddress>,
  InferCreationAttributes<UserAddress>
> {
  declare id: CreationOptional<string>;
  declare user_id: ForeignKey<User["id"]>;
  declare phone_number: string;
  declare name: string;
  declare address_line1: CreationOptional<string>;
  declare address_line2: CreationOptional<string>;
  declare landmark: CreationOptional<string>;
  declare city: CreationOptional<string>;
  declare state: CreationOptional<string>;
  declare pincode: CreationOptional<string>;

  static initModel(sequelize: Sequelize) {
    UserAddress.init(
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
            is: /^\+[1-9]\d{1,14}$/, // E.164 format
          },
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "users", // Table name, not model class
            key: "id",
          },
          onDelete: "CASCADE", // Optional: delete addresses when user is deleted
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        address_line1: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        address_line2: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        landmark: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        city: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        state: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        pincode: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "user_addresses",
        timestamps: true,
        underscored: true,
        indexes: [{ fields: ["phone_number"] }, { fields: ["user_id"] }],
      }
    );
  }

  static associate() {
    UserAddress.belongsTo(User, {
      foreignKey: "user_id",
      as: "user",
    });
  }
}
