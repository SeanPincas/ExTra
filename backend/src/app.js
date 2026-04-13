// App.js

import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimiter from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";

import { errorHandler } from "./middleware/error.middleware.js";

const app = express();
const allowedOrigins = ["http://localhost:5173"];
const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

// --------------------------------------------------
// API RATE LIMITER
// Limits repeated requests to public APIs
// --------------------------------------------------
const apiLimiter = rateLimiter({

    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
    message: {
        error: "Too many requests. Please try again later."
    },
    standardHeaders: true, // returns rate limit info in headers
    legacyHeaders: false
});

// --------------------------------------------------
// Core Middlewares
// --------------------------------------------------
// Enable CORS early so browser preflight requests succeed
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
// Parse incoming JSON bodies
app.use(express.json({ limit: "2mb" }));
// Security Header
app.use(helmet());
// Rate Limiter
app.use("/api", apiLimiter);
// Sanitize request payloads without reassigning req.query.
// express-mongo-sanitize@2.x mutates req.query by reassigning it,
// which conflicts with the current Express stack.
app.use((req, res, next) => {
    if (req.body) {
        mongoSanitize.sanitize(req.body);
    }

    if (req.params) {
        mongoSanitize.sanitize(req.params);
    }

    if (req.headers) {
        mongoSanitize.sanitize(req.headers);
    }

    if (req.query) {
        mongoSanitize.sanitize(req.query);
    }

    next();
});
// HTTP request logger
app.use(morgan("dev"));

// --------------------------------------------------
// Routes
// --------------------------------------------------
// Auth Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/quotes", quoteRoutes);

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
