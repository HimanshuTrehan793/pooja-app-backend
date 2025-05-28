import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
  DataTypes,
} from "sequelize";
import { User } from "./user.model";

export class Otp extends Model<
  InferAttributes<Otp>,
  InferCreationAttributes<Otp>
> {
  declare id: CreationOptional<string>;
  declare phone_number: string;
  declare otp_code: string;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  static initModel(sequelize: Sequelize) {
    Otp.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        phone_number: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            is: /^\+[1-9]\d{1,14}$/, // E.164 format
          },
        },
        otp_code: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "otps",
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    Otp.belongsTo(User, { foreignKey: "user_id", as: "user" });
  }
}
