import { Sequelize } from "sequelize";
import config from "../config/database.config.js";
import { Env } from "../interfaces/index.js";


const env: Env = "development"; //static for now, can be dynamic later
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

// Export both Sequelize class and instance
export default {
  Sequelize,
  sequelize,
};
