import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import {
    addToWishlist,
    getWishlist,
    removeFromWishlist
} from "../controllers/wishlist.controller.js";

const wishlistRoutes = express.Router();

wishlistRoutes.use(isAuthenticated);
wishlistRoutes.get("/", getWishlist);
wishlistRoutes.post("/:productId", addToWishlist);
wishlistRoutes.delete("/:productId", removeFromWishlist);

export default wishlistRoutes;
