import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const filter = { isActive: true };

    if (
      req.query.category &&
      ["Sparklers", "Gift Boxes", "Combos"].includes(req.query.category)
    ) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .limit(200);

    res.json({ products });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
});

export default router;