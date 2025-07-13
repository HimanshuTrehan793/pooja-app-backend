import { Sequelize } from "sequelize";
import config from "../config/database.config";
import { Env } from "../interfaces/index";
import { Product } from "./product.model";
import { ProductVariant } from "./productVariant.model";
import { User } from "./user.model";
import { Otp } from "./otp.model";
import { Category } from "./category.model";
import { Configuration } from "./configuration.model";
import { AdBanner } from "./adBanner.model";
import { CartItem } from "./cart.model";
import { Coupon } from "./coupon.model";
import { Address } from "./address.model";
import { OrderDetail } from "./orderDetail.model";
import { OrderAddress } from "./orderAddress.model";
import { OrderItem } from "./orderItem.model";
import { OrderHistory } from "./orderHistory.model";
import { OrderCoupon } from "./orderCoupon.model";
import { PaymentDetail } from "./paymentDetail.model";
import { OrderCharge } from "./orderCharge.model";
import { ProductReview } from "./productReview.model";

const env: Env = "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Initialize models
Product.initModel(sequelize);
ProductVariant.initModel(sequelize);
User.initModel(sequelize);
Otp.initModel(sequelize);
Category.initModel(sequelize);
Configuration.initModel(sequelize);
AdBanner.initModel(sequelize);
CartItem.initModel(sequelize);
Address.initModel(sequelize);
Coupon.initModel(sequelize);
OrderDetail.initModel(sequelize);
OrderAddress.initModel(sequelize);
OrderItem.initModel(sequelize);
OrderHistory.initModel(sequelize);
OrderCoupon.initModel(sequelize);
PaymentDetail.initModel(sequelize);
OrderCharge.initModel(sequelize);
ProductReview.initModel(sequelize);

// Setup associations
Product.associate();
ProductVariant.associate();
User.associate();
Category.associate();
Configuration.associate();
AdBanner.associate();
CartItem.associate();
Address.associate();
OrderDetail.associate();
OrderAddress.associate();
OrderItem.associate();
OrderHistory.associate();
OrderCoupon.associate();
PaymentDetail.associate();
OrderCharge.associate();
ProductReview.associate();

// Setup hooks
ProductVariant.setupHooks();

export const db = {
  sequelize,
  Product,
  ProductVariant,
  User,
  Otp,
  Category,
  Configuration,
  AdBanner,
  CartItem,
  Address,
  Coupon,
  OrderDetail,
  OrderAddress,
  OrderHistory,
  OrderItem,
  OrderCoupon,
  PaymentDetail,
  OrderCharge,
  ProductReview,
};
