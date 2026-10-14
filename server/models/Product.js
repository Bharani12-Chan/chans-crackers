
import mongoose from "mongoose";

export const PRODUCT_CATEGORIES = [
  "Sparklers",
  "Flower Pots",
  "Ground Chakkars",
  "Fountains",
  "Rockets",
  "Sky Shots",
  "Gift Boxes",
  "Family Combos",
  "Kids Collection",
  "Festival Specials",
  "Combos"
];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      enum: PRODUCT_CATEGORIES
    },

    description: {
      type: String,
      default: ""
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    oldPrice: {
      type: Number,
      default: 0,
      min: 0
    },

    stock: {
      type: Number,
      default: 0,
      min: 0
    },

    image: {
      type: String,
      default: ""
    },

    badge: {
      type: String,
      default: ""
    },

    featured: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model(
  "Product",
  productSchema
);

export default Product;
