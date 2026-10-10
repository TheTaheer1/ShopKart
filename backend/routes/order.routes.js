import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import { cancelPendingOrder, createPaymentOrder, getAllOrders, getOrderById, getOrders, retryPayment, verifyPayment } from "../controllers/order.controller.js";

const orderRoutes = express.Router();

orderRoutes.use(isAuthenticated);
orderRoutes.post("/create-payment-order", createPaymentOrder);
orderRoutes.post("/verify-payment", verifyPayment);
orderRoutes.post("/retry-payment/:id", retryPayment);
orderRoutes.post("/cancel/:id", cancelPendingOrder);
orderRoutes.get("/", getOrders);
orderRoutes.get("/admin", isAdmin, getAllOrders);
orderRoutes.get("/:id", getOrderById);

export default orderRoutes;
