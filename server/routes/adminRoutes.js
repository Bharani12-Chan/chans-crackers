
import express from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

// GET /api/admin/overview
router.get("/overview", async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      orderTotals
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      (await import("../models/Product.js")).default.countDocuments({
        isActive: true
      }),
      Order.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$total" }
          }
        }
      ])
    ]);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      demoOrderValue: orderTotals[0]?.total || 0
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/customers
router.get("/customers", async (req, res, next) => {
  try {
    const customers = await User.find({
      role: { $ne: "admin" }
    })
      .select("name email role isActive createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const orderCounts = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          orders: { $sum: 1 },
          totalValue: { $sum: "$total" }
        }
      }
    ]);

    const counts = new Map(
      orderCounts.map((item) => [
        String(item._id),
        item
      ])
    );

    res.json({
      customers: customers.map((customer) => {
        const count = counts.get(String(customer._id));

        return {
          ...customer,
          orderCount: count?.orders || 0,
          demoOrderValue: count?.totalValue || 0
        };
      })
    });
  } catch (error) {
    next(error);
  }
});

export default router;
