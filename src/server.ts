import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { db } from "./models";

import { corsOptions } from "./config/cors.config";

import { getEnvVar } from "./utils/getEnvVar";

import { errorHandler } from "./middlewares/errorHandler";
import { jsonSyntaxErrorHandler } from "./middlewares/jsonSyntaxErrorHandler";

import routes from "./routes";

const app = express();
const PORT = getEnvVar("PORT");

// CORS setup
app.use(cors(corsOptions));
app.use(express.json());
app.use(jsonSyntaxErrorHandler);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

app.use(errorHandler);

async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected.");

    await db.sequelize.sync();
    console.log("Database synced.");

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
