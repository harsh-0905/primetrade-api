require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const logger = require("./utils/logger");

// Route imports
const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// ─── Security Middleware ──────────────────────────────────────────
// Sets secure HTTP headers
app.use(helmet());

// CORS: only allow requests from our frontend
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Rate limiter: max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: "Too many requests, try again later." },
});
app.use("/api", limiter);

// ─── Body Parsing & Sanitization ─────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Strips $ and . from input to prevent NoSQL injection
app.use(mongoSanitize());

// ─── Logging ─────────────────────────────────────────────────────
// Log HTTP requests using morgan, pipe to winston
app.use(
  morgan("combined", {
    stream: { write: (msg) => logger.http(msg.trim()) },
  })
);

// ─── API Routes ───────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/admin", adminRoutes);

// ─── Swagger Docs ────────────────────────────────────────────────
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Health Check ────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── 404 Handler ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ────────────────────────────────────────
// Catches all errors thrown with next(err)
app.use((err, req, res, next) => {
  logger.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
