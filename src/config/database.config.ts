import dotenv from "dotenv";
dotenv.config();

import { getEnvVar } from "../utils/getEnvVar.js";
import { DBConfig, Env } from "../interfaces";

const config: Record<Env, DBConfig> = {
  development: {
    username: getEnvVar("DB_USER"),
    password: getEnvVar("DB_PASSWORD"),
    database: getEnvVar("DB_NAME"),
    host: getEnvVar("DB_HOST"),
    port: parseInt(getEnvVar("DB_PORT"), 10),
    dialect: "postgres",
    logging: false,
  },
};

export default config;
