import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Initialize env vars before importing route modules that depend on configs
dotenv.config();

import { errorHandler } from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser';
import passport from './config/jwt-strategy.js';

import authRoutes from './routes/AuthRoutes.js';
import categoryRoutes from './routes/CategoryRoutes.js';
import productRoutes from './routes/ProductRoutes.js';
import cartRoutes from './routes/CartRoutes.js';
import orderRoutes from './routes/OrderRoutes.js';
import accountRoutes from './routes/AccountRoutes.js';
import adminRoutes from './routes/AdminRoutes.js';
import uploadRoutes from './routes/UploadRoutes.js';
import cashfreeRoutes from './routes/CashfreeRoutes.js';

const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://localhost:5174'],
    credentials: true,
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hathkikala';
const LOCAL_URI = 'mongodb://127.0.0.1:27017/hathkikala';

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('MongoDB connected'))
    .catch(async (err) => {
        console.warn('Primary DB connection failed, attempting local MongoDB fallback...');
        try {
            await mongoose.connect(LOCAL_URI);
            console.log('MongoDB connected (Local Fallback)');
        } catch (localErr) {
            console.error('MongoDB connection error:', localErr);
        }
    });

app.use(cookieParser());
app.use(passport.initialize());

// routes
app.get('/', (req, res) => {
    res.send('API is running');
});
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payments/cashfree", cashfreeRoutes);

// Error handler must be registered LAST, after all routes
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});