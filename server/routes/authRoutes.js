import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { requireAuth, publicUser } from "../middleware/auth.js";

const router = express.Router();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createSession(req, user, res) {
  req.session.regenerate(error => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Could not create login session"
      });
    }

    req.session.userId = user.id;

    req.session.save(error => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "Could not save login session"
        });
      }

      res.json({
        success: true,
        user: publicUser(user)
      });
    });
  });
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (
      cleanName.length < 2 ||
      cleanName.length > 100 ||
      !emailPattern.test(cleanEmail) ||
      cleanEmail.length > 254 ||
      typeof password !== "string" ||
      password.length < 10 ||
      password.length > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid name, email and password of 10–72 characters"
      });
    }

    const existing = await User.findOne({ email: cleanEmail });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: "customer"
    });

    createSession(req, user, res);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
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
      !emailPattern.test(email) ||
      typeof password !== "string" ||
      password.length > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid email and password are required"
      });
    }

    const user = await User.findOne({
      email,
      isActive: true
    }).select("+passwordHash");

    const valid = user && await user.checkPassword(password);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    createSession(req, user, res);
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({
    success: true,
    user: publicUser(req.user)
  });
});

router.post("/logout", (req, res) => {
  if (!req.session) {
    return res.json({ success: true });
  }

  req.session.destroy(error => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Logout failed"
      });
    }

    res.clearCookie("cc.sid", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    res.json({
      success: true,
      message: "Logged out successfully"
    });
  });
});

export default router;