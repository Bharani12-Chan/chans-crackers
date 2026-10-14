
import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/Product.js";

const photo = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`;

const products = [
  {
    name: "Golden Sparkler Collection",
    category: "Sparklers",
    description:
      "A decorative festive sparkler collection. Demonstration listing; verify actual packaging and specifications before selling.",
    price: 199,
    oldPrice: 299,
    stock: 50,
    badge: "Popular",
    featured: true,
    image: photo("photo-1492684223066-81342ee5ff30")
  },
  {
    name: "Classic Flower Pot Pack",
    category: "Flower Pots",
    description:
      "A sample flower-pot fireworks listing for the Chan's Crackers product catalog.",
    price: 449,
    oldPrice: 599,
    stock: 35,
    badge: "Featured",
    featured: true,
    image: photo("photo-1467810563316-b5476525c0f9")
  },
  {
    name: "Festival Ground Chakkar Set",
    category: "Ground Chakkars",
    description:
      "A sample ground-chakkar product entry with editable pricing, stock and image.",
    price: 349,
    oldPrice: 499,
    stock: 40,
    badge: "Festival Pick",
    featured: true,
    image: photo("photo-1533236897111-3e94666b2edf")
  },
  {
    name: "Celebration Fountain Collection",
    category: "Fountains",
    description:
      "A demonstration fountain collection listing for festive occasions.",
    price: 699,
    oldPrice: 899,
    stock: 25,
    badge: "New",
    featured: true,
    image: photo("photo-1513151233558-d860c5398176")
  },
  {
    name: "Sky Celebration Rocket Pack",
    category: "Rockets",
    description:
      "A sample rocket-category listing. Replace the illustration with verified product photography.",
    price: 799,
    oldPrice: 1099,
    stock: 20,
    badge: "Premium",
    featured: false,
    image: photo("photo-1492684223066-81342ee5ff30")
  },
  {
    name: "Grand Sky Shot Collection",
    category: "Sky Shots",
    description:
      "A sample sky-shot product for testing the storefront and admin inventory.",
    price: 1499,
    oldPrice: 1899,
    stock: 15,
    badge: "Signature",
    featured: true,
    image: photo("photo-1467810563316-b5476525c0f9")
  },
  {
    name: "Premium Festival Gift Box",
    category: "Gift Boxes",
    description:
      "A gift-box category sample with editable product details and stock.",
    price: 999,
    oldPrice: 1399,
    stock: 30,
    badge: "Gift Pick",
    featured: true,
    image: photo("photo-1513151233558-d860c5398176")
  },
  {
    name: "Family Celebration Combo",
    category: "Family Combos",
    description:
      "A sample assorted celebration combo for demonstrating product browsing.",
    price: 1799,
    oldPrice: 2299,
    stock: 18,
    badge: "Combo",
    featured: true,
    image: photo("photo-1533236897111-3e94666b2edf")
  },
  {
    name: "Junior Festival Gift Collection",
    category: "Kids Collection",
    description:
      "A sample festive gift listing. This category does not imply fireworks are safe for children; any real product requires age-appropriate safety information and adult supervision.",
    price: 399,
    oldPrice: 549,
    stock: 45,
    badge: "Gift Collection",
    featured: false,
    image: photo("photo-1513151233558-d860c5398176")
  },
  {
    name: "Grand Festival Special Box",
    category: "Festival Specials",
    description:
      "A sample festival-special collection for the featured storefront catalog.",
    price: 2499,
    oldPrice: 3199,
    stock: 12,
    badge: "Festival Special",
    featured: true,
    image: photo("photo-1492684223066-81342ee5ff30")
  }
];

async function seedProducts() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    let added = 0;
    let skipped = 0;

    for (const item of products) {
      const existing = await Product.findOne({
        name: item.name
      });

      if (existing) {
        skipped++;
        console.log(`Skipped: ${item.name}`);
        continue;
      }

      await Product.create(item);
      added++;

      console.log(`Added: ${item.name}`);
    }

    console.log("--------------------------");
    console.log(`Added: ${added}`);
    console.log(`Already existed: ${skipped}`);
    console.log(`Seed definitions: ${products.length}`);
    console.log("--------------------------");
  } catch (error) {
    console.error("Product seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
