import express from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { upload } from '../middlewares/uploadMiddleware.js';
import { processVideoUpload } from '../controllers/uploadController.js'; 
import { handleExport } from '../controllers/exportController.js';
import { submitFeedback } from '../controllers/feedbackController.js';
import { refreshHighlights } from '../controllers/highlightsController.js';

const router = express.Router();

// Setup Multer to store the uploaded feedback image in memory so we can email it directly
// (We use memory storage here so it doesn't conflict with your video upload middleware)
const memoryUpload = multer({ storage: multer.memoryStorage() });

// Create the Anti-Spam Rate Limiter for Feedback
const feedbackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 feedback submissions per 15 minutes
    message: { 
        success: false, 
        message: 'You have sent too much feedback recently. Please try again later.' 
    }
});

// 🟢 The Health Check Route
// This tells Render "I am alive!"
router.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

// Route 1: Receives the video, saves it, and gets the AI text
router.post('/upload', upload.single('video'), processVideoUpload); 

// Route 2: Receives the text styles and burns them into the saved video
router.post('/export', handleExport);

// Route 3: Feedback route (No login required, rate-limited, stores image in memory)
router.post('/feedback', feedbackLimiter, memoryUpload.single('attachment'), submitFeedback);

// Route 4: Re-analyze transcript for AI highlights (no re-upload needed)
router.post('/refresh-highlights', refreshHighlights);

export default router;