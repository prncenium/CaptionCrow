import Project from '../models/Project.js';
import { convertToHinglish } from '../utils/hinglishConverter.js';
// 🚨 UPDATED IMPORT: Bring in the new analyzer
import { transcribeAudioWordLevel, analyzeTranscriptForHighlights } from '../services/groqService.js';
import { extractOptimizedAudio } from '../services/ffmpegService.js';
import fs from 'fs-extra';

export const regenerateTranscription = async (req, res, next) => {
    const { projectId } = req.params;

    try {
        const project = await Project.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found.' });
        }

        if (!project.videoUrl || !(await fs.pathExists(project.videoUrl))) {
            return res.status(400).json({ success: false, error: 'Source video file is missing.' });
        }

        const audioPath = await extractOptimizedAudio(project.videoUrl);
        const rawHindiTranscription = await transcribeAudioWordLevel(audioPath); 

        await fs.remove(audioPath).catch(err => console.error(`[Cleanup Error] ${err.message}`));

        const finalHinglishTranscription = await convertToHinglish(rawHindiTranscription);

        // 👇 1. NEW: Combine words into a single string for LLaMA to read 👇
        const fullTranscriptText = finalHinglishTranscription.map(w => w.word || w.text).join(' ');
        
        // 👇 2. NEW: Get the smart highlights array 👇
        const highlightedWords = await analyzeTranscriptForHighlights(fullTranscriptText);

        project.transcription = finalHinglishTranscription;
        await project.save();

        res.status(200).json({ 
            success: true, 
            message: 'Transcription regenerated successfully.',
            data: finalHinglishTranscription,
            // 👇 3. NEW: Send the smart array back to the React frontend 👇
            aiHighlights: highlightedWords 
        });

    } catch (error) {
        next(error);
    }
};