
import express from "express";
import { requireAuth, safeUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return res.json({ user: null });
    }

    const { default: User } = await import("../models/User.js");

    const user = await User.findById(req.session.userId);

    if (!user || !user.isActive) {
      return res.json({ user: null });
    }

    res.json({ user: safeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", requireAuth, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie("cc.sid");

    res.json({
      message: "Logged out successfully"
    });
  });
});

export default router;
