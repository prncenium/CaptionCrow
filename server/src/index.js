import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';

// Import configurations, routes, and middlewares
import { connectDB } from './config/db.js';
import apiRoutes from './routes/apiRoutes.js';
import projectRoutes from './routes/projectRoutes.js'; // NEW: Imported project routes
import { errorHandler } from './middlewares/errorHandler.js';

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));

// Connect to MongoDB (Requires MONGO_URI in your .env file)
connectDB();

// Core Middlewares
app.use(cors({
    origin: ['http://localhost:5173', 'https://your-app-name.vercel.app'],
    credentials: true
})); // Allows your Vite frontend to communicate with this API
app.use(express.json()); // Parses incoming JSON payloads
app.use('/downloads', express.static(path.resolve('temp_uploads')));
app.use(express.urlencoded({ extended: true }));

// Ensure the temporary upload directory exists at server startup
const tempDir = path.resolve('temp_uploads');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Health Check Route (Useful for testing deployments)
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Caption-Crow Server is highly optimized and active.' });
});

// Mount the core video processing pipeline
// This will make your upload endpoint accessible at: POST http://localhost:5000/api/upload
app.use('/api', apiRoutes);

// Mount the project and audio extraction endpoints
// This makes endpoints like POST /api/projects/:projectId/extract-audio available
app.use('/api/projects', projectRoutes); // NEW: Mounted the project routes

// Global Error Handler 
// CRITICAL: This must remain the absolute last piece of middleware in the file so it catches all thrown errors.
app.use(errorHandler);

// Initialize Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📂 Temporary upload directory ready at: ${tempDir}`);
});