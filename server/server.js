
import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import MongoStore from "connect-mongo";
import rateLimit from "express-rate-limit";

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// ==========================================
// DATABASE CONNECTION
// ==========================================

import { connectDB } from "./config/db.js";

// ==========================================
// EXISTING ROUTES
// ==========================================

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// ==========================================
// NEW ROUTES
// ==========================================

import sessionRoutes from "./routes/sessionRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";

// ==========================================
// EXPRESS APPLICATION
// ==========================================

const app = express();

const production = process.env.NODE_ENV === "production";

const PORT = Number(process.env.PORT || 5000);

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);

const clientDist = path.resolve(
  __dirname,
  "../client/dist"
);

// ==========================================
// ENVIRONMENT VALIDATION
// ==========================================

if (!process.env.MONGO_URI) {
  throw new Error(
    "MONGO_URI is missing from environment variables"
  );
}

if (!process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET is missing from environment variables"
  );
}

if (process.env.SESSION_SECRET.length < 32) {
  throw new Error(
    "SESSION_SECRET must contain at least 32 characters"
  );
}

// ==========================================
// RENDER PROXY CONFIGURATION
// ==========================================

if (production) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

// ==========================================
// SECURITY HEADERS
// ==========================================

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// ==========================================
// CORS CONFIGURATION
// ==========================================

// Development:
// React Vite runs on localhost:5173.
// Express runs on localhost:5000.
//
// Production:
// React and Express use the same origin.

if (!production) {
  app.use(
    cors({
      origin:
        process.env.CLIENT_URL ||
        "http://localhost:5173",

      credentials: true
    })
  );
}

// ==========================================
// BODY PARSER
// ==========================================

app.use(
  express.json({
    limit: "100kb"
  })
);

// ==========================================
// MONGODB SESSION STORE
// ==========================================

const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,

  collectionName: "sessions",

  ttl: 7 * 24 * 60 * 60
});

// ==========================================
// SESSION CONFIGURATION
// ==========================================

app.use(
  session({
    name: "cc.sid",

    secret: process.env.SESSION_SECRET,

    store,

    resave: false,

    saveUninitialized: false,

    rolling: true,

    cookie: {
      httpOnly: true,

      secure: production,

      sameSite: "lax",

      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  })
);

// ==========================================
// API REQUEST ORIGIN VALIDATION
// ==========================================

// Protect state-changing API requests.
// GET, HEAD and OPTIONS remain readable.
//
// Accepted origins:
// - The Express server itself
// - The Vite development frontend
// - The deployed Render domain (same origin)

app.use("/api", (req, res, next) => {
  if (
    ["GET", "HEAD", "OPTIONS"].includes(req.method)
  ) {
    return next();
  }

  const origin = req.get("origin");
  const referer = req.get("referer");

  if (!origin && !referer) {
    return res.status(403).json({
      message: "Request origin is required"
    });
  }

  try {
    const requestOrigin = new URL(
      origin || referer
    ).origin;

    const serverOrigin =
      `${req.protocol}://${req.get("host")}`;

    const allowedOrigins = [serverOrigin];

    if (!production) {
      allowedOrigins.push(
        process.env.CLIENT_URL ||
        "http://localhost:5173"
      );
    }

    if (!allowedOrigins.includes(requestOrigin)) {
      return res.status(403).json({
        message: "Request origin not allowed"
      });
    }

    next();
  } catch {
    return res.status(403).json({
      message: "Invalid request origin"
    });
  }
});

// ==========================================
// AUTHENTICATION RATE LIMITER
// ==========================================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 15,

  standardHeaders: "draft-7",

  legacyHeaders: false,

  message: {
    message:
      "Too many attempts. Please try again later."
  }
});

// ==========================================
// API HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,

    application: "Chan's Crackers",

    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",

    environment:
      production
        ? "production"
        : "development"
  });
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

app.use(
  "/api/auth/login",
  authLimiter
);

app.use(
  "/api/auth/register",
  authLimiter
);

app.use(
  "/api/auth",
  authRoutes
);

// ==========================================
// SESSION VERIFICATION AND LOGOUT
// ==========================================

// GET  /api/session-state/me
// POST /api/session-state/logout

app.use(
  "/api/session-state",
  sessionRoutes
);

// ==========================================
// PRODUCT ROUTES
// ==========================================

// GET /api/products
// Other product operations remain in
// your existing productRoutes.js.

app.use(
  "/api/products",
  productRoutes
);

// ==========================================
// CUSTOMER ORDER ROUTES
// ==========================================

// POST /api/orders
// GET  /api/orders/my
//
// Uses existing orderRoutes.js.
// Orders are saved to MongoDB.

app.use(
  "/api/orders",
  orderRoutes
);

// ==========================================
// EXISTING ADMIN ROUTES
// ==========================================

// Preserve the existing admin features,
// including customer and product management.
//
// Authorization is handled in adminRoutes.js.

app.use(
  "/api/admin",
  adminRoutes
);

// ==========================================
// ADMIN ORDER MANAGEMENT
// ==========================================

// GET   /api/admin-orders
// PATCH /api/admin-orders/:id/status
//
// requireAuth and requireAdmin are enforced
// inside adminOrderRoutes.js.

app.use(
  "/api/admin-orders",
  adminOrderRoutes
);

// ==========================================
// API 404 HANDLER
// ==========================================

app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API endpoint not found"
  });
});

// ==========================================
// SERVE REACT PRODUCTION BUILD
// ==========================================

if (fs.existsSync(clientDist)) {
  app.use(
    express.static(clientDist, {
      index: false
    })
  );

  // React Router fallback.
  // Express 4 supports the "*" route.
  // Express 5 requires a named wildcard.

  const reactFallback = (req, res) => {
    res.sendFile(
      path.join(clientDist, "index.html")
    );
  };

  const expressMajor = Number(
    (
      express?.application?.version ||
      ""
    ).split(".")[0]
  );

  // Use middleware fallback to avoid wildcard
  // incompatibilities between Express 4 and 5.
  // API requests have already been handled above.

  app.use((req, res, next) => {
    if (
      req.method !== "GET" &&
      req.method !== "HEAD"
    ) {
      return next();
    }

    if (req.path.startsWith("/api/")) {
      return next();
    }

    reactFallback(req, res);
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      message:
        "Backend running. Run npm run build to generate React frontend."
    });
  });
}

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((error, req, res, next) => {
  console.error(
    "Server error:",
    error
  );

  // Handle MongoDB transaction write conflicts.
  if (
    error.code === 112 ||
    error.codeName === "WriteConflict"
  ) {
    return res.status(409).json({
      message:
        "Product stock changed. Please retry your order."
    });
  }

  // Invalid MongoDB ObjectId.
  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Invalid record ID"
    });
  }

  // MongoDB validation errors.
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: error.message
    });
  }

  const status =
    Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status < 500
      ? error.status
      : 500;

  res.status(status).json({
    message:
      status < 500
        ? error.message
        : "Server error. Please try again."
  });
});

// ==========================================
// START SERVER
// ==========================================

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          "===================================="
        );

        console.log(
          "CHAN'S CRACKERS SERVER RUNNING"
        );

        console.log(`Port: ${PORT}`);

        console.log(
          `Environment: ${
            production
              ? "Production"
              : "Development"
          }`
        );

        console.log("MongoDB: Connected");

        console.log(
          `Local website: http://localhost:${PORT}`
        );

        console.log(
          "Customer Orders: /api/orders"
        );

        console.log(
          "Admin Orders: /api/admin-orders"
        );

        console.log(
          "Session API: /api/session-state"
        );

        console.log(
          "===================================="
        );
      }
    );

    async function shutdown() {
      server.close(async () => {
        await mongoose.disconnect();
        await store.close();
        process.exit(0);
      });
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error(
      "Startup failed:",
      error.message
    );

    process.exit(1);
  }
}

startServer();
