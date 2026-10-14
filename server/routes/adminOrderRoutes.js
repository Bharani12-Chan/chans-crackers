
import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import {
  requireAuth,
  requireAdmin
} from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/", async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    const allowed = [
      "Placed",
      "Processing",
      "Completed",
      "Cancelled"
    ];

    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({
        message: "Invalid order status"
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

export default router;
