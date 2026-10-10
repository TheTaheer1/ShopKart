import mongoose from "mongoose";
import Product from "../models/product.model.js";

const wishlistFields = "name price category image stock";

const validateProductId = (productId, res) => {
    if (mongoose.isValidObjectId(productId)) return true;

    res.status(400).json({
        success: false,
        message: "Invalid product ID"
    });
    return false;
};

export const addToWishlist = async (req, res) => {
    const { productId } = req.params;

    if (!validateProductId(productId, res)) return;

    try {
        const product = await Product.findById(productId).select("_id");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const alreadyWishlisted = req.user.wishlist.some(
            (savedProductId) => savedProductId.equals(product._id)
        );

        if (alreadyWishlisted) {
            return res.status(409).json({
                success: false,
                message: "Product is already in wishlist"
            });
        }

        req.user.wishlist.push(product._id);
        await req.user.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getWishlist = async (req, res) => {
    try {
        await req.user.populate({ path: "wishlist", select: wishlistFields });
        const wishlist = req.user.wishlist.filter(Boolean);

        return res.status(200).json({
            success: true,
            count: wishlist.length,
            wishlist
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const removeFromWishlist = async (req, res) => {
    const { productId } = req.params;

    if (!validateProductId(productId, res)) return;

    try {
        const savedProductIndex = req.user.wishlist.findIndex(
            (savedProductId) => savedProductId.equals(productId)
        );

        if (savedProductIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist"
            });
        }

        req.user.wishlist.splice(savedProductIndex, 1);
        await req.user.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
