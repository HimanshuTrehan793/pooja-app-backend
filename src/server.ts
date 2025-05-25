import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./models/index.js";

dotenv.config();

const app = express();

// CORS options
const corsOptions = {
  origin: "http://localhost:8081",
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple route
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to the pooja-samagari backend." });
});

// Server port
const PORT = process.env.PORT || 8080;

// Start function (connect DB → sync → start server)
async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected.");

    await db.sequelize.sync();
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
