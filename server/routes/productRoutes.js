
import express from "express";
import mongoose from "mongoose";
import Product, {
  PRODUCT_CATEGORIES
} from "../models/Product.js";
import {
  requireAuth,
  requireAdmin
} from "../middleware/auth.js";

const router = express.Router();

const adminOnly = [requireAuth, requireAdmin];

const editableFields = [
  "name",
  "category",
  "description",
  "price",
  "oldPrice",
  "stock",
  "image",
  "badge",
  "featured",
  "isActive"
];

function validateProduct(body, partial = false) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return { error: "Invalid product data" };
  }

  const data = {};

  for (const field of editableFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = body[field];
    }
  }

  if (!partial || data.name !== undefined) {
    if (
      typeof data.name !== "string" ||
      !data.name.trim() ||
      data.name.trim().length > 120
    ) {
      return { error: "Enter a valid product name" };
    }

    data.name = data.name.trim();
  }

  if (!partial || data.category !== undefined) {
    if (!PRODUCT_CATEGORIES.includes(data.category)) {
      return { error: "Select a valid category" };
    }
  }

  for (const field of ["price", "oldPrice", "stock"]) {
    if (data[field] === undefined) continue;

    const number = Number(data[field]);

    if (
      data[field] === "" ||
      !Number.isFinite(number) ||
      number < 0 ||
      number > 10000000 ||
      (field === "stock" && !Number.isSafeInteger(number))
    ) {
      return { error: `Invalid ${field}` };
    }

    data[field] = number;
  }

  if (!partial) {
    if (data.price === undefined) {
      return { error: "Product price is required" };
    }

    if (data.stock === undefined) data.stock = 0;
    if (data.oldPrice === undefined) data.oldPrice = 0;
  }

  for (const field of ["description", "image", "badge"]) {
    if (data[field] === undefined) continue;

    if (typeof data[field] !== "string") {
      return { error: `Invalid ${field}` };
    }

    data[field] = data[field].trim();

    const max = field === "description" ? 2000 : 500;

    if (data[field].length > max) {
      return { error: `${field} is too long` };
    }
  }

  if (data.image) {
    const isLocal = data.image.startsWith("/") &&
      !data.image.startsWith("//");

    let isRemote = false;

    try {
      const url = new URL(data.image);
      isRemote = ["http:", "https:"].includes(url.protocol);
    } catch {
      isRemote = false;
    }

    if (!isLocal && !isRemote) {
      return {
        error: "Image must be an HTTPS/HTTP URL or local /images/ path"
      };
    }
  }

  for (const field of ["featured", "isActive"]) {
    if (
      data[field] !== undefined &&
      typeof data[field] !== "boolean"
    ) {
      return { error: `Invalid ${field}` };
    }
  }

  return { data };
}

// ========================================
// PUBLIC: ALL ACTIVE PRODUCTS
// GET /api/products
// ========================================

router.get("/", async (req, res, next) => {
  try {
    const filter = { isActive: true };

    if (req.query.category) {
      if (!PRODUCT_CATEGORIES.includes(req.query.category)) {
        return res.status(400).json({
          message: "Invalid category"
        });
      }

      filter.category = req.query.category;
    }

    const products = await Product.find(filter)
      .sort({
        featured: -1,
        createdAt: -1,
        _id: -1
      })
      .lean();

    res.json({
      products,
      total: products.length,
      categories: PRODUCT_CATEGORIES
    });
  } catch (error) {
    next(error);
  }
});

// ========================================
// ADMIN: LIST ACTIVE + INACTIVE
// GET /api/products/admin/all
// ========================================

router.get("/admin/all", ...adminOnly, async (req, res, next) => {
  try {
    const products = await Product.find({})
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    res.json({
      products,
      total: products.length,
      categories: PRODUCT_CATEGORIES
    });
  } catch (error) {
    next(error);
  }
});

// ========================================
// ADMIN: ADD PRODUCT
// POST /api/products/admin
// ========================================

router.post("/admin", ...adminOnly, async (req, res, next) => {
  try {
    const result = validateProduct(req.body);

    if (result.error) {
      return res.status(400).json({
        message: result.error
      });
    }

    const product = await Product.create(result.data);

    res.status(201).json({
      message: "Product created successfully",
      product
    });
  } catch (error) {
    next(error);
  }
});

// ========================================
// ADMIN: UPDATE PRODUCT
// PATCH /api/products/admin/:id
// ========================================

router.patch(
  "/admin/:id",
  ...adminOnly,
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid product ID"
        });
      }

      const result = validateProduct(req.body, true);

      if (result.error) {
        return res.status(400).json({
          message: result.error
        });
      }

      if (!Object.keys(result.data).length) {
        return res.status(400).json({
          message: "No valid changes provided"
        });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: result.data },
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
  }
);

// ========================================
// ADMIN: DEACTIVATE PRODUCT
// PATCH /api/products/admin/:id/deactivate
// ========================================

router.patch(
  "/admin/:id/deactivate",
  ...adminOnly,
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid product ID"
        });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: { isActive: false } },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      res.json({
        message: "Product deactivated",
        product
      });
    } catch (error) {
      next(error);
    }
  }
);

// ========================================
// PUBLIC: SINGLE PRODUCT
// GET /api/products/:id
// ========================================

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
});

export default router;
