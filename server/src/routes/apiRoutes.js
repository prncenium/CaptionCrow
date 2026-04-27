import express from 'express';
import { upload } from '../middlewares/uploadMiddleware.js';
import { processVideoUpload } from '../controllers/uploadController.js'; 
import { handleExport } from '../controllers/exportController.js';

const router = express.Router();

// 🟢 ADD THIS: The Health Check Route
// This tells Render "I am alive!"
router.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

// Route 1: Receives the video, saves it, and gets the AI text
router.post('/upload', upload.single('video'), processVideoUpload); 

// Route 2: Receives the text styles and burns them into the saved video
router.post('/export', handleExport);

export default router;