import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import MongoStore from "connect-mongo";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const PORT = Number(process.env.PORT || 5000);
const production = process.env.NODE_ENV === "production";

for (const key of ["MONGO_URI", "SESSION_SECRET", "CLIENT_URL"]) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

if (process.env.SESSION_SECRET.length < 32) {
  console.error("SESSION_SECRET must contain at least 32 characters");
  process.exit(1);
}

if (production) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "100kb" }));

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: "sessions",
  ttl: 7 * 24 * 60 * 60,
  autoRemove: "native"
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
    message: "Too many attempts. Try again later."
  }
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    application: "Chan's Crackers API",
    message: "Backend is running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    application: "Chan's Crackers",
    database: mongoose.connection.readyState === 1
      ? "Connected"
      : "Disconnected",
    authentication: "MongoDB-backed sessions"
  });
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register", loginLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

app.use((error, req, res, next) => {
  console.error("API error:", error);

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

    const server = app.listen(PORT, () => {
      console.log(
        `Chan's Crackers API running at http://localhost:${PORT}`
      );
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
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
}

start();