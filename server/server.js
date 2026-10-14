
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

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// ==========================================
// APPLICATION CONFIGURATION
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
// CHECK ENVIRONMENT VARIABLES
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
// TRUST RENDER PROXY
// ==========================================

if (production) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// ==========================================
// CORS CONFIGURATION
// ==========================================

// Development frontend on port 5173.
// Production React is served from the same
// origin as Express, so CORS is unnecessary.

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
// FIXED REQUEST ORIGIN VALIDATION
// ==========================================

// Allows:
// 1. http://localhost:5000
// 2. http://localhost:5173 in development
// 3. Your actual Render domain
//
// Blocks unrelated origins for
// state-changing API requests.

app.use("/api", (req, res, next) => {

  // Read-only requests can proceed.
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

    // req.get("host") contains the hostname
    // and port used to access Express.
    const serverOrigin =
      `${req.protocol}://${req.get("host")}`;

    const allowedOrigins = [serverOrigin];

    // Vite development frontend.
    if (!production) {
      allowedOrigins.push(
        process.env.CLIENT_URL ||
        "http://localhost:5173"
      );
    }

    // Reject requests from other origins.
    if (!allowedOrigins.includes(requestOrigin)) {
      return res.status(403).json({
        message: "Request origin not allowed"
      });
    }

    next();

  } catch (error) {

    return res.status(403).json({
      message: "Invalid request origin"
    });

  }
});

// ==========================================
// LOGIN RATE LIMITING
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
      production ? "production" : "development"
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
// PRODUCT ROUTES
// ==========================================

app.use(
  "/api/products",
  productRoutes
);

// ==========================================
// CUSTOMER ORDER ROUTES
// ==========================================

app.use(
  "/api/orders",
  orderRoutes
);

// ==========================================
// ADMIN ROUTES
// ==========================================

// Actual admin authorization is enforced
// inside adminRoutes.js.

app.use(
  "/api/admin",
  adminRoutes
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

  // Serve CSS, JavaScript and other assets.
  app.use(
    express.static(clientDist, {
      index: false
    })
  );

  // React Router fallback.
  // Supports /login, /admin, /shop etc.
  app.get("*", (req, res) => {

    res.sendFile(
      path.join(
        clientDist,
        "index.html"
      )
    );

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

  const status =
    error.status >= 400 && error.status < 500
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

        console.log(
          `Port: ${PORT}`
        );

        console.log(
          `Environment: ${
            production
              ? "Production"
              : "Development"
          }`
        );

        console.log(
          "MongoDB: Connected"
        );

        console.log(
          `Local website: http://localhost:${PORT}`
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

    process.on(
      "SIGINT",
      shutdown
    );

    process.on(
      "SIGTERM",
      shutdown
    );

  } catch (error) {

    console.error(
      "Startup failed:",
      error.message
    );

    process.exit(1);

  }

}

startServer();
