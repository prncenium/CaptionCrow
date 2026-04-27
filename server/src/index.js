import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';

// Import configurations, routes, and middlewares
import { connectDB } from './config/db.js';
import apiRoutes from './routes/apiRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Core Middlewares
app.use(cors({
    // IMPORTANT: Once your Vercel site is live, add the URL here
    origin: ['http://localhost:5173', 'https://your-app-name.vercel.app'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// Global Error Handler (Must be last)
app.use(errorHandler);

// 🟢 Initialize Server with '0.0.0.0' binding
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📂 Temporary upload directory ready at: ${tempDir}`);
});