import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { db } from "./models";
import authRoutes from "./routes/auth.routes";
import { getEnvVar } from "./utils/getEnvVar";
import { errorHandler } from "./middlewares/errorHandler";


const app = express();
const PORT = getEnvVar("PORT");

app.use(cors({ origin: "http://localhost:8081" }));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);

// app.all("*", (req: Request, res: Response, next: NextFunction) => {
//   return next(
//     new ApiError(
//       `Route not found: ${req.originalUrl}`,
//       HttpStatusCode.NOT_FOUND,
//       "Not Found"
//     )
//   );
// });

app.use(errorHandler);

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
