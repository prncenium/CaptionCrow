import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caption-crow');
        console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[MongoDB] Connection Error: ${error.message}`);
        // Don't crash — upload/export/transcription routes work without MongoDB.
        // Only auth routes (login/register) need the DB.
        console.warn('[MongoDB] Server starting without database — auth routes will be unavailable');
    }
};