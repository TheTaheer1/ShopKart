import mongoose from "mongoose";
import { Readable } from "stream";
import Product from "../models/product.model.js";
import { getCloudinary } from "../utils/cloudinary.js";

const productFields = "name description price category image stock createdAt";

const requiredFields = [
    "name",
    "description",
    "price",
    "category",
    "image",
    "stock"
];

const hasMissingField = (productData) => requiredFields.some((field) => {
    const value = productData[field];
    return value === undefined || value === null || value === "";
});

const uploadImageBuffer = (fileBuffer) => new Promise((resolve, reject) => {
    const uploadStream = getCloudinary().uploader.upload_stream(
        {
            folder: "shopkart/products",
            resource_type: "image"
        },
        (error, result) => {
            if (error) return reject(error);
            return resolve(result);
        }
    );

    Readable.from(fileBuffer).pipe(uploadStream);
});

export const uploadProductImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Please select an image to upload"
        });
    }

    try {
        const uploadedImage = await uploadImageBuffer(req.file.buffer);

        return res.status(201).json({
            success: true,
            message: "Image uploaded successfully",
            image: {
                url: uploadedImage.secure_url,
                publicId: uploadedImage.public_id
            }
        });
    } catch (error) {
        return res.status(502).json({
            success: false,
            message: "Unable to upload image to Cloudinary"
        });
    }
};

export const createProduct = async (req, res) => {
    const { name, description, price, category, image, stock } = req.body;
    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (hasMissingField(req.body)) {
        return res.status(400).json({
            success: false,
            message: "Name, description, price, category, image and stock are required"
        });
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({
            success: false,
            message: "Price must be greater than 0"
        });
    }

    if (!Number.isFinite(numericStock) || numericStock < 0) {
        return res.status(400).json({
            success: false,
            message: "Stock cannot be negative"
        });
    }

    try {
        const product = await Product.create({
            name,
            description,
            price: numericPrice,
            category,
            image,
            stock: numericStock
        });

        return res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query;
        const query = {};

        if (search?.trim()) {
            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            query.name = { $regex: escapedSearch, $options: "i" };
        }

        if (category?.trim()) {
            query.category = category.trim();
        }

        const sortOrder = sort === "price_asc"
            ? { price: 1 }
            : sort === "price_desc"
                ? { price: -1 }
                : { createdAt: -1 };

        const products = await Product.find(query)
            .select(productFields)
            .sort(sortOrder);

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    try {
        const product = await Product.findById(id).select(productFields);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
