import fs from 'fs-extra';
import { extractOptimizedAudio } from '../services/ffmpegService.js';
// 🚨 IMPORT ADDED: Bring in the AI Intelligence analyzer
import { transcribeAudioWordLevel, analyzeTranscriptForHighlights } from '../services/groqService.js';
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

        // Step 3: Translate Hindi -> Hinglish
        const hinglishWords = await convertToHinglish(rawHindiWords);

        // 👇 NEW STEP 4: The Intelligence Layer 👇
        // Combine all the words into a single paragraph for LLaMA to read
        const fullTranscriptText = hinglishWords.map(w => w.word || w.text).join(' ');
        
        // Ask LLaMA to find the important nouns, names, and verbs
        const highlightedWords = await analyzeTranscriptForHighlights(fullTranscriptText);

        // Step 5: Respond instantly to the frontend
        res.status(200).json({ 
            success: true, 
            data: hinglishWords, 
            originalFileName: req.file.filename,
            // 👇 CRITICAL ADDITION: Send the highlighted words array back to React
            aiHighlights: highlightedWords 
        });
    } catch (error) {
        next(error); 
    } finally {
        // Selective garbage collection
        if (audioPath) {
            await fs.remove(audioPath).catch(err => console.error(`[Cleanup Error] ${err.message}`));
        }
    }
};