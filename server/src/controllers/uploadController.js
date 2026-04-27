import fs from 'fs-extra';
import { extractOptimizedAudio } from '../services/ffmpegService.js';
import { transcribeAudioWordLevel } from '../services/groqService.js';
import { convertToHinglish } from '../utils/hinglishConverter.js';

export const processVideoUpload = async (req, res, next) => {
    if (!req.file) return res.status(400).json({ success: false, error: 'No video uploaded' });

    const videoPath = req.file.path;
    let audioPath = null;

    try {
        // Step 1: Rip the lightweight audio
        audioPath = await extractOptimizedAudio(videoPath);

        // Step 2: Push to AI for timestamps (This returns the raw Hindi)
        const rawHindiWords = await transcribeAudioWordLevel(audioPath);

        // 👇 THE FIX: Inject the converter here to translate Hindi -> Hinglish 👇
        const hinglishWords = await convertToHinglish(rawHindiWords);

        // Step 3: Respond instantly to the frontend (NOW INCLUDES THE FILENAME)
        res.status(200).json({ 
            success: true, 
            // 👇 CHANGE: Send the new 'hinglishWords' instead of the raw Hindi 👇
            data: hinglishWords, 
            originalFileName: req.file.filename // CRITICAL: We need this to find the video later during export
        });
    } catch (error) {
        next(error); 
    } finally {
        // Step 4: Selective garbage collection
        // DO NOT delete the video file here, the export pipeline needs it!
        // We only clean up the temporary MP3 audio file.
        if (audioPath) {
            await fs.remove(audioPath).catch(err => console.error(`[Cleanup Error] ${err.message}`));
        }
    }
};