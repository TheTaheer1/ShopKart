import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "./models/product.model.js";

const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(backendDirectory, ".env") });

const products = [
    {
        name: "Mechanical Keyboard",
        description: "A compact mechanical keyboard with tactile switches and bright backlighting.",
        price: 2999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
        stock: 10
    },
    {
        name: "Everyday Cotton Shirt",
        description: "A breathable cotton shirt designed for comfortable everyday wear.",
        price: 1499,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=900&q=80",
        stock: 24
    },
    {
        name: "Ceramic Desk Planter",
        description: "A minimal ceramic planter that adds a calm touch to desks and shelves.",
        price: 799,
        category: "Home",
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80",
        stock: 8
    }
];

try {
    await mongoose.connect(process.env.dbUrl);

    for (const product of products) {
        await Product.updateOne(
            { name: product.name },
            { $set: product },
            { upsert: true }
        );
    }

    console.log(`Seeded ${products.length} products.`);
} catch (error) {
    console.error("Product seeding failed:", error.message);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}