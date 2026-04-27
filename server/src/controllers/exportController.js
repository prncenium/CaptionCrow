import path from 'path';
import fs from 'fs';
import { generateAssFile } from '../utils/subtitleGenerator.js';
import { burnSubtitles } from '../services/renderService.js';

export const handleExport = async (req, res, next) => {
    try {
        const { transcription, styles, originalFileName } = req.body;

        if (!transcription || !styles || !originalFileName) {
            return res.status(400).json({ success: false, message: 'Missing required export data.' });
        }

        const tempDir = path.resolve('temp_uploads');
        const inputVideoPath = path.join(tempDir, originalFileName);
        
        if (!fs.existsSync(inputVideoPath)) {
            return res.status(404).json({ success: false, message: 'Original video file not found on server.' });
        }

        // Generate unique filenames for this specific export task
        const uniqueId = Date.now();
        const assFilePath = path.join(tempDir, `subtitles_${uniqueId}.ass`);
        const outputVideoName = `exported_${uniqueId}.mp4`;
        const outputVideoPath = path.join(tempDir, outputVideoName);

        // 1. Generate the subtitle formatting file
        generateAssFile(transcription, styles, assFilePath);

        // 2. Instruct FFmpeg to burn the video
        await burnSubtitles(inputVideoPath, assFilePath, outputVideoPath);

        // 3. Return the URL so the React frontend can download it
        // We assume Express is serving the temp_uploads folder statically
        const downloadUrl = `http://localhost:5000/downloads/${outputVideoName}`;

        res.status(200).json({
            success: true,
            downloadUrl: downloadUrl
        });

    } catch (error) {
        next(error);
    }
};