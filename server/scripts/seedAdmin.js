import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

async function seedAdmin() {
  try {
    const email = String(process.env.ADMIN_EMAIL || "")
      .trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "Store Administrator";

    if (
      !process.env.MONGO_URI ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !password ||
      password.length < 12 ||
      password.length > 72
    ) {
      throw new Error(
        "Set MONGO_URI, ADMIN_EMAIL and a 12–72 character ADMIN_PASSWORD"
      );
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email });

    if (existing) {
      console.log("An account already exists for this email.");
      console.log("No role or password changes were made.");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      passwordHash,
      role: "admin"
    });

    console.log("Initial admin account created successfully");
    console.log("Admin email:", email);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();