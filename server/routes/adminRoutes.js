import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import {
  requireAuth, requireAdmin, publicUser
} from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

const categories = ["Sparklers", "Gift Boxes", "Combos"];
const statuses = ["Placed", "Processing", "Completed", "Cancelled"];

function validateProduct(body) {
  const name = String(body.name || "").trim();
  const category = body.category;
  const price = Number(body.price);
  const oldPrice = Number(body.oldPrice || 0);
  const stock = Number(body.stock);
  const image = String(body.image || "").trim();
  const description = String(body.description || "").trim();
  const badge = String(body.badge || "").trim();

  if (
    name.length < 2 || name.length > 150 ||
    !categories.includes(category) ||
    !Number.isFinite(price) || price < 0 ||
    !Number.isFinite(oldPrice) || oldPrice < 0 ||
    !Number.isSafeInteger(stock) || stock < 0 ||
    description.length > 2000 ||
    badge.length > 80 ||
    image.length > 2000 ||
    (image && !/^https?:\/\/\S+$/i.test(image))
  ) {
    return null;
  }

  return {
    name, category, price, oldPrice,
    stock, image, description, badge
  };
}

router.get("/stats", async (req, res, next) => {
  try {
    const [products, orders, customers, revenue] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        products,
        orders,
        customers,
        demoRevenue: revenue[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/products", async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
});

router.post("/products", async (req, res, next) => {
  try {
    const data = validateProduct(req.body);

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Invalid product details"
      });
    }

    const product = await Product.create(data);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

router.put("/products/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const data = validateProduct(req.body);

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Invalid product details"
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

router.delete("/products/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    // Soft deletion preserves historical order references.
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product removed from storefront"
    });
  } catch (error) {
    next(error);
  }
});

router.get("/orders", async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

router.patch("/orders/:id/status", async (req, res, next) => {
  try {
    if (
      !mongoose.isValidObjectId(req.params.id) ||
      !statuses.includes(req.body.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order or status"
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find()
      .select("name email role isActive createdAt")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({
      success: true,
      users: users.map(publicUser)
    });
  } catch (error) {
    next(error);
  }
});

router.post("/admins", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    if (
      name.length < 2 || name.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      typeof password !== "string" ||
      password.length < 12 ||
      password.length > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid name, email and 12–72 character password required"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await User.create({
      name,
      email,
      passwordHash,
      role: "admin"
    });

    res.status(201).json({
      success: true,
      user: publicUser(admin)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }
    next(error);
  }
});

export default router;