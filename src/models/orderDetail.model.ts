import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { User } from "./user.model";
import { OrderAddress } from "./orderAddress.model";
import { OrderItem } from "./orderItem.model";
import { OrderHistory } from "./orderHistory.model";
import { OrderCoupon } from "./orderCoupon.model";
import { PaymentDetail } from "./paymentDetail.model";

export class OrderDetail extends Model<
  InferAttributes<OrderDetail>,
  InferCreationAttributes<OrderDetail>
> {
  declare id: CreationOptional<string>;
  declare user_id: ForeignKey<User["id"]>;
  declare status:
    | "pending"
    | "accepted"
    | "processing"
    | "packed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "rejected"
    | "refunded"
    | "returned";
  declare order_number: CreationOptional<number>;
  declare delivered_at: CreationOptional<Date | null>;
  declare expected_delivery_date: Date;
  declare cancellation_reason: CreationOptional<string | null>;

  static initModel(sequelize: Sequelize) {
    OrderDetail.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        status: {
          type: DataTypes.ENUM(
            "pending",
            "accepted",
            "processing",
            "packed",
            "shipped",
            "out_for_delivery",
            "delivered",
            "cancelled",
            "rejected",
            "returned",
            "refunded"
          ),
          allowNull: false,
          defaultValue: "pending",
        },
        order_number: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          unique: true,
          allowNull: false,
        },
        delivered_at: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
        expected_delivery_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        cancellation_reason: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        tableName: "order_details",
        underscored: true,
        timestamps: true,
      }
    );
  }

  static associate() {
    OrderDetail.belongsTo(User, {
      foreignKey: "user_id",
      as: "user",
    });

    OrderDetail.hasMany(OrderItem, {
      foreignKey: "order_id",
      as: "order_items",
      onDelete: "CASCADE",
    });

    OrderDetail.hasOne(OrderAddress, {
      foreignKey: "order_id",
      as: "order_address",
      onDelete: "CASCADE",
    });

    OrderDetail.hasMany(OrderHistory, {
      foreignKey: "order_id",
      as: "order_histories",
      onDelete: "CASCADE",
    });

    OrderDetail.hasMany(OrderCoupon, {
      foreignKey: "order_id",
      as: "order_coupons",
      onDelete: "CASCADE",
    });

    OrderDetail.hasOne(PaymentDetail, {
      foreignKey: "order_id",
      as: "payment_details",
      onDelete: "CASCADE",
    })
  }
}
