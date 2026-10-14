import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

async function main() {
  try {
    const email = String(process.env.ADMIN_EMAIL || "")
      .trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "Store Administrator";

    if (
      !process.env.MONGO_URI ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== "string" ||
      password.length < 12 ||
      password.length > 72
    ) {
      throw new Error(
        "Configure MONGO_URI, ADMIN_EMAIL and a 12–72 character ADMIN_PASSWORD"
      );
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("An administrator already exists.");
      console.log("No additional administrator was created.");
      return;
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      throw new Error(
        "That email is already registered as a customer. Choose another admin email."
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      passwordHash,
      role: "admin"
    });

    console.log("Initial administrator created successfully.");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();