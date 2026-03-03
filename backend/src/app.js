// App.js

import express from "express";
import cors from "cors";
import morgan from "morgan"

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();
// --------------------------------------------------
// Core Middlewares
// --------------------------------------------------
// Parse incoming JSON bodies
app.use(express.json());
// Enable CORS
app.use(cors());
// HTTP request logger
app.use(morgan("dev"));

// --------------------------------------------------
// Routes
// --------------------------------------------------
// Auth Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// Temporary root route
app.get("/", (req, res) => {
  res.json({
    name: "ExTra API",
    status: "running",
  });
});

// --------------------------------------------------
// Global Error Handler (MUST BE LAST)
// --------------------------------------------------
app.use(errorHandler);

export default app;