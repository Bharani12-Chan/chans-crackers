import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  customer: String,
  email: String,
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
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
    required: true
  },
  status: {
    type: String,
    enum: ["Placed", "Processing", "Completed", "Cancelled"],
    default: "Placed"
  },
  paymentStatus: {
    type: String,
    default: "Demo Only",
    immutable: true
  }
}, { timestamps: true });

export default mongoose.model("Order", schema);