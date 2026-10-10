import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import { parseCookie } from "cookie";
import Customer from "./models/customer.model.js";


const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(backendDirectory, ".env") });


const app = express();
const httpServer = createServer(app);


// Middleware

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((url) => url.trim()).filter(Boolean) : []),
];

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
}));

const io = new Server(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
});

io.use(async (socket, next) => {
    try {
        const cookies = socket.handshake.headers.cookie ? parseCookie(socket.handshake.headers.cookie) : {};
        const token = socket.handshake.auth?.token || cookies.token;
        if (!token) return next(new Error("Not authenticated"));
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const customer = await Customer.findById(decoded.customerId).select("_id isAdmin");
        if (!customer) return next(new Error("Not authenticated"));
        socket.user = customer;
        next();
    } catch {
        next(new Error("Not authenticated"));
    }
});

io.on("connection", (socket) => {
    socket.join(`customer:${socket.user._id}`);
    if (socket.user.isAdmin) socket.join("admins");
});
app.set("io", io);

app.get("/health", (_request, response) => {
    response.json({ ok: true });
});

// Routes

app.use(
    "/customers",
    customerRoutes
);

app.use(
    "/products",
    productRoutes
);

app.use(
    "/wishlist",
    wishlistRoutes
);

app.use(
    "/cart",
    cartRoutes
);

app.use(
    "/orders",
    orderRoutes
);


// MongoDB connection

mongoose
    .connect(process.env.dbUrl)
    .then(() => {
        console.log("DB Connected");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error);
    });


// Server

const PORT = process.env.PORT || 8088;

httpServer.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`);
});
