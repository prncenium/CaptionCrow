import fs from 'fs-extra';
import { extractOptimizedAudio } from '../services/ffmpegService.js';
import Project from '../models/Project.js';

/**
 * Handles standalone audio extraction for an existing project.
 * Useful for decoupled processing or allowing users to download just the audio track.
 */
export const processAudioExtraction = async (req, res, next) => {
    const { projectId } = req.params;

    try {
        const project = await Project.findById(projectId);
        
        if (!project || !project.videoUrl) {
            return res.status(404).json({ 
                success: false, 
                error: 'Project or video file not found in the database.' 
            });
        }

        // Verify the actual video file still exists on the server/hard drive
        if (!(await fs.pathExists(project.videoUrl))) {
            return res.status(400).json({ 
                success: false, 
                error: 'Source video file is missing from the server storage.' 
            });
        }

        // Trigger the high-speed FFmpeg service
        const audioPath = await extractOptimizedAudio(project.videoUrl);

        res.status(200).json({
            success: true,
            message: 'Audio extracted successfully.',
            data: {
                audioPath: audioPath 
            }
        });

    } catch (error) {
        next(error);
    }
};