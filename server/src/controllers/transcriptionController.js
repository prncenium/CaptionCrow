import Project from '../models/Project.js';
import { convertToHinglish } from '../utils/hinglishConverter.js';
import { transcribeAudioWordLevel } from '../services/groqService.js';
import { extractOptimizedAudio } from '../services/ffmpegService.js';

import fs from 'fs-extra';

/**
 * Regenerates or fetches transcription for an existing saved project.
 * Useful for when a user wants to retry AI generation or reset their workspace.
 */
export const regenerateTranscription = async (req, res, next) => {
    const { projectId } = req.params;

    try {
        const project = await Project.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found.' });
        }

        // In a full production app, you would fetch the videoUrl from AWS S3 here.
        // For local development, we verify the file exists on the local machine.
        if (!project.videoUrl || !(await fs.pathExists(project.videoUrl))) {
            return res.status(400).json({ success: false, error: 'Source video file is missing.' });
        }

        // Run the optimized extraction and transcription pipeline
        const audioPath = await extractOptimizedAudio(project.videoUrl);
        
        // 1. Get the raw Hindi from the audio
        const rawHindiTranscription = await transcribeAudioWordLevel(audioPath); 

        // Clean up the temporary audio immediately
        await fs.remove(audioPath).catch(err => console.error(`[Cleanup Error] ${err.message}`));

        // 👇 2. NEW: Pass the Hindi through the converter to get Hinglish 👇
        const finalHinglishTranscription = await convertToHinglish(rawHindiTranscription);

        // 👇 3. NEW: Save the Hinglish version to your database 👇
        project.transcription = finalHinglishTranscription;
        await project.save();

        res.status(200).json({ 
            success: true, 
            message: 'Transcription regenerated successfully.',
            // 👇 4. NEW: Send the Hinglish version to your React frontend 👇
            data: finalHinglishTranscription 
        });

    } catch (error) {
        next(error);
    }
};