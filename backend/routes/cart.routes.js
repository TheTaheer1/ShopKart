import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { addToCart, getCart, removeFromCart, updateCartQuantity } from "../controllers/cart.controller.js";

const cartRoutes = express.Router();

cartRoutes.use(isAuthenticated);
cartRoutes.get("/", getCart);
cartRoutes.post("/:productId", addToCart);
cartRoutes.patch("/:productId", updateCartQuantity);
cartRoutes.delete("/:productId", removeFromCart);

export default cartRoutes;
