import crypto from "crypto";
import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { getRazorpay } from "../config/razorpay.js";

const productFields = "name price image stock";
const addressFields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];

const normaliseAddress = (address = {}) => Object.fromEntries(
    addressFields.map((field) => [field, typeof address[field] === "string" ? address[field].trim() : ""])
);

const validateAddress = (address) => {
    const cleanAddress = normaliseAddress(address);
    const missingField = addressFields.find((field) => !cleanAddress[field]);
    if (missingField) return { error: `${missingField} is required` };
    if (!/^\d{10}$/.test(cleanAddress.phone)) return { error: "Phone number must contain 10 digits" };
    if (!/^\d{6}$/.test(cleanAddress.pincode)) return { error: "Pincode must contain 6 digits" };
    return { address: cleanAddress };
};

const getCurrentCartProducts = async (cart) => {
    const ids = cart.map((item) => item.product);
    const products = await Product.find({ _id: { $in: ids } }).select(productFields);
    const productById = new Map(products.map((product) => [String(product._id), product]));

    return cart.map((item) => {
        const product = productById.get(String(item.product));
        if (!product) throw new Error("A product in your cart is no longer available");
        if (item.quantity > product.stock) throw new Error(`Insufficient stock for ${product.name}`);
        return {
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            image: product.image
        };
    });
};

export const createPaymentOrder = async (req, res) => {
    const validation = validateAddress(req.body.shippingAddress);
    if (validation.error) return res.status(400).json({ success: false, message: validation.error });

    try {
        const customer = await Customer.findById(req.user._id).select("cart");
        if (!customer.cart.length) return res.status(400).json({ success: false, message: "Your cart is empty" });

        const items = await getCurrentCartProducts(customer.cart);
        const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const order = await Order.create({ user: customer._id, items, shippingAddress: validation.address, totalAmount });

        try {
            const razorpayOrder = await getRazorpay().orders.create({
                amount: Math.round(totalAmount * 100),
                currency: "INR",
                receipt: `shopkart_${order._id}`,
                notes: { shopkartOrderId: String(order._id), userId: String(customer._id) }
            });
            order.razorpayOrderId = razorpayOrder.id;
            await order.save();

            return res.status(201).json({
                success: true,
                orderId: order._id,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                keyId: process.env.RAZORPAY_KEY_ID
            });
        } catch (paymentError) {
            await Order.deleteOne({ _id: order._id });
            const configurationError = paymentError.message === "Razorpay Test Mode keys are not configured";
            return res.status(503).json({
                success: false,
                message: configurationError ? "Razorpay Test Mode keys are not configured on the server" : "Unable to start payment. Please try again."
            });
        }
    } catch (error) {
        if (error.message?.startsWith("Insufficient stock") || error.message?.includes("no longer available")) {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Unable to create order" });
    }
};

export const verifyPayment = async (req, res) => {
    const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ success: false, message: "Payment verification details are required" });
    }

    try {
        const order = await Order.findOne({ razorpayOrderId, user: req.user._id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        if (order.paymentStatus === "PAID") {
            await Customer.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });
            return res.status(200).json({ success: true, message: "Payment already verified", order });
        }

        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");
        const providedSignature = Buffer.from(razorpaySignature);
        const expectedSignatureBuffer = Buffer.from(expectedSignature);
        const isValid = providedSignature.length === expectedSignatureBuffer.length
            && crypto.timingSafeEqual(expectedSignatureBuffer, providedSignature);
        if (!isValid) {
            order.paymentStatus = "FAILED";
            await order.save();
            return res.status(400).json({ success: false, message: "Payment signature verification failed" });
        }

        // Recheck stock at the irreversible fulfilment point and decrement it.
        for (const item of order.items) {
            const result = await Product.updateOne({ _id: item.product, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } });
            if (result.modifiedCount !== 1) {
                return res.status(409).json({ success: false, message: `Stock is no longer available for ${item.name}. Please contact support.` });
            }
        }

        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpayPaymentId;
        await order.save();
        const clearedCustomer = await Customer.findByIdAndUpdate(
            req.user._id,
            { $set: { cart: [] } },
            { returnDocument: "after" }
        ).select("cart");

        if (!clearedCustomer || clearedCustomer.cart.length !== 0) {
            return res.status(500).json({ success: false, message: "Order placed, but cart could not be cleared. Please refresh and contact support." });
        }

        const io = req.app.get("io");
        const event = { orderId: String(order._id) };
        io?.to("admins").emit("orders:changed", event);
        io?.to(`customer:${req.user._id}`).emit("orders:changed", event);

        return res.status(200).json({ success: true, message: "Payment verified and order placed", order });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to verify payment" });
    }
};

export const retryPayment = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid order ID" });

    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        if (order.paymentStatus === "PAID") return res.status(409).json({ success: false, message: "This order has already been paid" });
        if (order.status !== "PENDING_PAYMENT") return res.status(409).json({ success: false, message: "This order is no longer waiting for payment" });

        const razorpayOrder = await getRazorpay().orders.create({
            amount: Math.round(order.totalAmount * 100),
            currency: "INR",
            receipt: `shopkart_${order._id}_retry_${Date.now()}`,
            notes: { shopkartOrderId: String(order._id), userId: String(req.user._id) }
        });
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(200).json({
            success: true,
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        const configurationError = error.message === "Razorpay Test Mode keys are not configured";
        return res.status(configurationError ? 503 : 500).json({
            success: false,
            message: configurationError ? "Razorpay Test Mode keys are not configured on the server" : "Unable to restart payment. Please try again."
        });
    }
};

export const cancelPendingOrder = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid order ID" });

    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        if (order.paymentStatus === "PAID" || order.status !== "PENDING_PAYMENT") {
            return res.status(409).json({ success: false, message: "Only pending payment orders can be cancelled" });
        }

        order.status = "CANCELLED";
        order.paymentStatus = "CANCELLED";
        await order.save();

        const io = req.app.get("io");
        const event = { orderId: String(order._id) };
        io?.to("admins").emit("orders:changed", event);
        io?.to(`customer:${req.user._id}`).emit("orders:changed", event);

        return res.status(200).json({ success: true, order });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to cancel order" });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, orders });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to load orders" });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "fullName email phone").sort({ createdAt: -1 });
        return res.status(200).json({ success: true, orders });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to load all orders" });
    }
};

export const getOrderById = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid order ID" });
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        return res.status(200).json({ success: true, order });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to load order" });
    }
};
