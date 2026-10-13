import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  category: {
    type: String,
    required: true,
    enum: ["Sparklers", "Gift Boxes", "Combos"]
  },
  description: {
    type: String,
    default: "",
    maxlength: 2000
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
    required: true,
    min: 0,
    validate: Number.isInteger
  },
  image: {
    type: String,
    default: ""
  },
  badge: {
    type: String,
    default: ""
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);