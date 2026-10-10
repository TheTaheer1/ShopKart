import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

const productFields = "name price category image stock";

const invalidProductId = (productId, res) => {
    if (mongoose.isValidObjectId(productId)) return false;

    res.status(400).json({ success: false, message: "Invalid product ID" });
    return true;
};

const getPopulatedCart = async (customerId) => {
    const customer = await Customer.findById(customerId).populate({
        path: "cart.product",
        select: productFields
    });

    return customer.cart.filter((item) => item.product);
};

const sendCart = async (res, customerId, message) => {
    const cart = await getPopulatedCart(customerId);
    return res.status(200).json({ success: true, message, cart });
};

export const addToCart = async (req, res) => {
    const { productId } = req.params;
    if (invalidProductId(productId, res)) return;

    try {
        const product = await Product.findById(productId).select("stock");
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const existingItem = req.user.cart.find((item) => item.product.equals(product._id));
        const nextQuantity = existingItem ? existingItem.quantity + 1 : 1;

        if (nextQuantity > product.stock) {
            return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });
        }

        if (existingItem) {
            existingItem.quantity = nextQuantity;
        } else {
            req.user.cart.push({ product: product._id, quantity: 1 });
        }

        await req.user.save();
        return sendCart(res, req.user._id, "Cart updated");
    } catch {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getCart = async (req, res) => {
    try {
        return sendCart(res, req.user._id, "Cart loaded");
    } catch {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const updateCartQuantity = async (req, res) => {
    const { productId } = req.params;
    const quantity = Number(req.body.quantity);

    if (invalidProductId(productId, res)) return;
    if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ success: false, message: "Quantity must be a whole number of at least 1" });
    }

    try {
        const product = await Product.findById(productId).select("stock");
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const item = req.user.cart.find((cartItem) => cartItem.product.equals(product._id));
        if (!item) {
            return res.status(404).json({ success: false, message: "Product is not in your cart" });
        }
        if (quantity > product.stock) {
            return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });
        }

        item.quantity = quantity;
        await req.user.save();
        return sendCart(res, req.user._id, "Cart quantity updated");
    } catch {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const removeFromCart = async (req, res) => {
    const { productId } = req.params;
    if (invalidProductId(productId, res)) return;

    try {
        const itemIndex = req.user.cart.findIndex((item) => item.product.equals(productId));
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: "Product is not in your cart" });
        }

        req.user.cart.splice(itemIndex, 1);
        await req.user.save();
        return sendCart(res, req.user._id, "Product removed from cart");
    } catch {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
