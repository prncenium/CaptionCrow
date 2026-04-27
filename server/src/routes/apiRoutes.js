import express from 'express';
import { upload } from '../middlewares/uploadMiddleware.js';
import { processVideoUpload } from '../controllers/uploadController.js'; // Fixed Name
import { handleExport } from '../controllers/exportController.js';

const router = express.Router();

// Route 1: Receives the video, saves it, and gets the AI text
router.post('/upload', upload.single('video'), processVideoUpload); // Fixed Name

// Route 2: Receives the text styles and burns them into the saved video
router.post('/export', handleExport);

export default router;