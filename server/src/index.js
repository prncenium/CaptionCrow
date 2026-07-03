import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';

// Import configurations, routes, and middlewares
import { connectDB } from './config/db.js';
import apiRoutes from './routes/apiRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Core Middlewares
const allowedOrigins = [
    'http://localhost:5173',
    process.env.CLIENT_URL,           // set this in Render dashboard
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (Postman, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/downloads', express.static(path.resolve('temp_uploads')));

// Ensure the temporary upload directory exists at server startup
const tempDir = path.resolve('temp_uploads');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// 🟢 Health Check Route for Render
// Match this to whatever you put in the Render "Health Check Path" field
app.get('/api/healthz', (req, res) => {
    res.status(200).json({ status: 'active', message: 'Server is healthy' });
});

// Mount the core video processing pipeline
app.use('/api', apiRoutes);

// Mount the project and audio extraction endpoints
app.use('/api/projects', projectRoutes);

// Mount auth endpoints
app.use('/api/auth', authRoutes);

// Global Error Handler (Must be last)
app.use(errorHandler);

// 🟢 Initialize Server with '0.0.0.0' binding
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📂 Temporary upload directory ready at: ${tempDir}`);
});