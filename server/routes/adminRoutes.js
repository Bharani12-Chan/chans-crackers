
import express from "express";
import mongoose from "mongoose";

import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

import {
  requireAuth,
  requireAdmin
} from "../middleware/auth.js";

const router = express.Router();

// All routes below require an authenticated administrator.
router.use(requireAuth, requireAdmin);

const categories = ["Sparklers", "Gift Boxes", "Combos"];

const statuses = [
  "Placed",
  "Processing",
  "Completed",
  "Cancelled"
];

// ------------------------------------------
// PRODUCT VALIDATION
// ------------------------------------------

function parseProduct(body = {}) {
  const data = {
    name: String(body.name || "").trim(),
    category: body.category,
    description: String(body.description || "").trim(),
    price: Number(body.price),
    oldPrice: Number(body.oldPrice || 0),
    stock: Number(body.stock),
    image: String(body.image || "").trim(),
    badge: String(body.badge || "").trim(),
    featured: body.featured === true
  };

  const valid =
    data.name.length >= 2 &&
    data.name.length <= 150 &&
    categories.includes(data.category) &&
    data.description.length <= 2000 &&
    Number.isFinite(data.price) &&
    data.price >= 1 &&
    Number.isFinite(data.oldPrice) &&
    data.oldPrice >= 0 &&
    Number.isSafeInteger(data.stock) &&
    data.stock >= 0 &&
    data.image.length <= 2000 &&
    (!data.image ||
      /^https?:\/\/\S+$/i.test(data.image)) &&
    data.badge.length <= 80;

  return valid ? data : null;
}

// ------------------------------------------
// DASHBOARD STATISTICS
// GET /api/admin/stats
// ------------------------------------------

router.get("/stats", async (req, res, next) => {
  try {
    const [
      products,
      customers,
      orders,
      revenue,
      lowStock
    ] = await Promise.all([
      Product.countDocuments({
        isActive: true
      }),

      User.countDocuments({
        role: "customer"
      }),

      Order.countDocuments(),

      Order.aggregate([
        {
          $match: {
            status: { $ne: "Cancelled" }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" }
          }
        }
      ]),

      Product.countDocuments({
        isActive: true,
        stock: { $lte: 5 }
      })
    ]);

    res.json({
      stats: {
        products,
        customers,
        orders,
        revenue: revenue[0]?.total || 0,
        lowStock
      }
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------
// GET ALL ACTIVE PRODUCTS
// GET /api/admin/products
// ------------------------------------------

router.get("/products", async (req, res, next) => {
  try {
    const products = await Product.find({
      isActive: true
    }).sort({
      createdAt: -1
    });

    res.json({ products });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------
// ADD NEW PRODUCT
// POST /api/admin/products
// ------------------------------------------

router.post("/products", async (req, res, next) => {
  try {
    const data = parseProduct(req.body);

    if (!data) {
      return res.status(400).json({
        message: "Please enter valid product details"
      });
    }

    const product = await Product.create(data);

    res.status(201).json({
      message: "Product added successfully",
      product
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------
// UPDATE EXISTING PRODUCT
// PUT /api/admin/products/:id
// ------------------------------------------

router.put("/products/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const data = parseProduct(req.body);

    if (!data) {
      return res.status(400).json({
        message: "Please enter valid product details"
      });
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        isActive: true
      },
      { $set: data },
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------
// REMOVE PRODUCT FROM STOREFRONT
// DELETE /api/admin/products/:id
// ------------------------------------------

router.delete("/products/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        isActive: true
      },
      {
        $set: { isActive: false }
      },
      {
        new: true
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product removed from storefront"
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------
// GET ALL CUSTOMER ORDERS
// GET /api/admin/orders
// ------------------------------------------

router.get("/orders", async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(300);

    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------
// UPDATE ORDER STATUS
// PATCH /api/admin/orders/:id/status
// ------------------------------------------

router.patch(
  "/orders/:id/status",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid order ID"
        });
      }

      if (!statuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid order status"
        });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      // A cancelled order cannot be reopened.
      if (order.status === "Cancelled") {
        if (status === "Cancelled") {
          return res.json({
            message: "Order is already cancelled",
            order
          });
        }

        return res.status(409).json({
          message: "Cancelled orders cannot be reopened"
        });
      }

      // A completed order cannot be changed.
      if (order.status === "Completed") {
        if (status === "Completed") {
          return res.json({
            message: "Order is already completed",
            order
          });
        }

        return res.status(409).json({
          message: "Completed orders cannot be modified"
        });
      }

      // Enforce forward-only order progression.
      const allowedTransitions = {
        Placed: ["Processing", "Cancelled"],
        Processing: ["Completed", "Cancelled"]
      };

      if (status === order.status) {
        return res.json({
          message: "Order status is unchanged",
          order
        });
      }

      if (
        !allowedTransitions[order.status]?.includes(status)
      ) {
        return res.status(409).json({
          message: "This order status change is not allowed"
        });
      }

      // --------------------------------------
      // CANCEL ORDER AND RESTORE STOCK
      // --------------------------------------

      if (status === "Cancelled") {
        const session = await mongoose.startSession();

        try {
          await session.withTransaction(async () => {
            // Only one request can successfully cancel
            // the order and restore its stock.
            const changed = await Order.updateOne(
              {
                _id: order._id,
                status: order.status
              },
              {
                $set: { status: "Cancelled" }
              },
              { session }
            );

            if (changed.modifiedCount !== 1) {
              const error = new Error(
                "Order was already updated"
              );
              error.status = 409;
              throw error;
            }

            for (const item of order.items) {
              await Product.updateOne(
                { _id: item.product },
                {
                  $inc: {
                    stock: item.quantity
                  }
                },
                { session }
              );
            }
          });
        } finally {
          await session.endSession();
        }
      } else {
        // Atomic forward-only status update.
        const changed = await Order.updateOne(
          {
            _id: order._id,
            status: order.status
          },
          {
            $set: { status }
          }
        );

        if (changed.modifiedCount !== 1) {
          return res.status(409).json({
            message:
              "Order was updated by another request. Refresh and try again."
          });
        }
      }

      const updatedOrder = await Order.findById(id);

      res.json({
        message: "Order status updated successfully",
        order: updatedOrder
      });
    } catch (error) {
      next(error);
    }
  }
);

// ------------------------------------------
// GET REGISTERED CUSTOMERS
// GET /api/admin/users
// ------------------------------------------

router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find({
      role: "customer"
    })
      .select(
        "name email role isActive createdAt"
      )
      .sort({
        createdAt: -1
      });

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------
// EXPORT ROUTER
// ------------------------------------------

export default router;
