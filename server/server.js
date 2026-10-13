import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import MongoStore from "connect-mongo";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

const PORT = Number(process.env.PORT || 5000);
const production = process.env.NODE_ENV === "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, "../client/dist");

for (const key of ["MONGO_URI", "SESSION_SECRET"]) {
  if (!process.env[key]) {
    console.error(`Missing environment variable: ${key}`);
    process.exit(1);
  }
}

if (process.env.SESSION_SECRET.length < 32) {
  console.error("SESSION_SECRET must be at least 32 characters");
  process.exit(1);
}

if (production) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

app.use(helmet({
  contentSecurityPolicy: false
}));

// In production, React and Express share one origin.
// CORS is only needed during local Vite development.
if (!production) {
  app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  }));
}

app.use(express.json({ limit: "100kb" }));

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: "sessions",
  ttl: 7 * 24 * 60 * 60
});

app.use(session({
  name: "cc.sid",
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: production,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again later."
  }
});

// Backend API
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    application: "Chan's Crackers",
    database: mongoose.connection.readyState === 1
      ? "Connected"
      : "Disconnected"
  });
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register", loginLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Unknown API endpoints must return JSON, not React HTML.
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

// Serve the built React frontend
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, {
    index: false
  }));

  // React Router fallback for frontend GET requests
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "Backend running. React build not found.",
      hint: "Run npm run build from the project root."
    });
  });
}

// Centralized error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.status && error.status < 500
      ? error.message
      : "An unexpected server error occurred"
  });
});

async function start() {
  try {
    await connectDB();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`React build directory: ${clientDist}`);
      console.log("React and API available from one server");
    });

    async function shutdown() {
      server.close(async () => {
        await mongoose.disconnect();
        await sessionStore.close();
        process.exit(0);
      });
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

start();