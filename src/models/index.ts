// models/index.ts
import { Sequelize } from "sequelize";
import config from "../config/database.config";
import { Env } from "../interfaces/index";
import { Product } from "./product.model";
import { ProductVariant } from "./productVariant.model";
import { User } from "./user.model";
import { Otp } from "./otp.model";
import { Category } from "./category.model";
import { Configuration } from "./configuration.model";
import { AdBanner } from "./ad-banner.model";
import { CartItem } from "./cart.model";

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

// Setup associations
Product.associate();
ProductVariant.associate();
Category.associate();
Configuration.associate();
AdBanner.associate();
CartItem.associate();

// setup hooks
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
};
