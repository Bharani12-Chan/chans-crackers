import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { requireAuth, safeUser } from "../middleware/auth.js";

const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function respondWithSession(req, res, user, status = 200) {
  req.session.regenerate(error => {
    if (error) {
      return res.status(500).json({
        message: "Unable to create session"
      });
    }

    req.session.userId = user.id;

    req.session.save(error => {
      if (error) {
        return res.status(500).json({
          message: "Unable to save session"
        });
      }

      res.status(status).json({ user: safeUser(user) });
    });
  });
}

router.post("/register", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    if (
      name.length < 2 ||
      name.length > 100 ||
      !emailRegex.test(email) ||
      email.length > 254 ||
      typeof password !== "string" ||
      password.length < 10 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: "Enter a valid name, email and password (10–72 characters)"
      });
    }

    // Never allow public registration to claim the admin identity.
    if (
      process.env.ADMIN_EMAIL &&
      email === process.env.ADMIN_EMAIL.trim().toLowerCase()
    ) {
      return res.status(409).json({
        message: "This email is reserved for the administrator"
      });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        message: "Already registered. Please log in instead"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "customer"
    });

    respondWithSession(req, res, user, 201);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    if (
      !emailRegex.test(email) ||
      typeof password !== "string" ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: "Valid email and password required"
      });
    }

    const user = await User.findOne({
      email,
      isActive: true
    }).select("+passwordHash");

    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({
        message: "Incorrect email or password"
      });
    }

    respondWithSession(req, res, user);
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: safeUser(req.user) });
});

router.post("/logout", (req, res) => {
  req.session.destroy(error => {
    if (error) {
      return res.status(500).json({
        message: "Logout failed"
      });
    }

    res.clearCookie("cc.sid", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    res.json({ message: "Logged out successfully" });
  });
});

export default router;