import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./models";
import { corsOptions } from "./config/cors.config";

import productRoutes from './routes/product.route'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// CORS setup
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/product",productRoutes)

// Basic route
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to the pooja-samagari backend." });
});

// Start server and DB
async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected.");

    await db.sequelize.sync(); // sync all models

    console.log("✅ Database synced.");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}.`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
