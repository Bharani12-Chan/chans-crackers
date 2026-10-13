import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/my", async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { items, address } = req.body;

    if (!Array.isArray(items) || !items.length || items.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid cart"
      });
    }

    const fields = [
      "fullName", "phone", "line1",
      "city", "state", "pincode"
    ];

    if (
      !address ||
      typeof address !== "object" ||
      fields.some(field =>
        typeof address[field] !== "string" ||
        !address[field].trim() ||
        address[field].length > 200
      ) ||
      !/^\d{6}$/.test(address.pincode)
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide complete delivery information"
      });
    }

    const quantities = new Map();

    for (const item of items) {
      const id = item.productId;

      if (
        !mongoose.isValidObjectId(id) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid cart item"
        });
      }

      quantities.set(id, (quantities.get(id) || 0) + item.quantity);
    }

    if ([...quantities.values()].some(quantity => quantity > 100)) {
      return res.status(400).json({
        success: false,
        message: "Quantity limit exceeded"
      });
    }

    const products = await Product.find({
      _id: { $in: [...quantities.keys()] },
      isActive: true
    });

    if (products.length !== quantities.size) {
      return res.status(400).json({
        success: false,
        message: "One or more products are unavailable"
      });
    }

    const orderItems = products.map(product => ({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: quantities.get(product.id)
    }));

    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );

    // MongoDB Atlas supports transactions on replica-set clusters.
    // Inventory and order creation succeed or fail together.
    const session = await mongoose.startSession();
    let order;

    try {
      await session.withTransaction(async () => {
        for (const item of orderItems) {
          const updated = await Product.updateOne(
            {
              _id: item.product,
              isActive: true,
              stock: { $gte: item.quantity }
            },
            { $inc: { stock: -item.quantity } },
            { session }
          );

          if (updated.modifiedCount !== 1) {
            const error = new Error(
              `${item.name} does not have enough stock`
            );
            error.status = 409;
            throw error;
          }
        }

        const created = await Order.create([{
          user: req.user._id,
          customer: req.user.name,
          email: req.user.email,
          items: orderItems,
          address: Object.fromEntries(
            fields.map(field => [field, address[field].trim()])
          ),
          total,
          status: "Placed",
          paymentStatus: "Demo Success"
        }], { session });

        order = created[0];
      });
    } finally {
      await session.endSession();
    }

    res.status(201).json({
      success: true,
      message: "Demo order placed; no payment was charged",
      order
    });
  } catch (error) {
    next(error);
  }
});

export default router;