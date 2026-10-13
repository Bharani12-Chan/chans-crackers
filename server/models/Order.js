import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  customer: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: String,
    image: String,
    price: Number,
    quantity: Number
  }],
  address: {
    fullName: String,
    phone: String,
    line1: String,
    city: String,
    state: String,
    pincode: String
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["Placed", "Processing", "Completed", "Cancelled"],
    default: "Placed"
  },
  paymentStatus: {
    type: String,
    enum: ["Demo Success"],
    default: "Demo Success"
  }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);