import express from "express";
import {
	createProduct,
	getProductById,
	getProducts,
	uploadProductImage
} from "../controllers/product.controller.js";
import { uploadProductImageFile } from "../middlewares/productImageUpload.js";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";

const productRoutes = express.Router();

productRoutes.post("/", isAuthenticated, isAdmin, createProduct);
productRoutes.post("/upload-image", isAuthenticated, isAdmin, uploadProductImageFile, uploadProductImage);
productRoutes.get("/", getProducts);
productRoutes.get("/:id", getProductById);

export default productRoutes;
