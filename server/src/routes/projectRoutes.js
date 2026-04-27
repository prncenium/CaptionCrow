import express from 'express';
import Project from '../models/Project.js';
import { regenerateTranscription } from '../controllers/transcriptionController.js';

const router = express.Router();

// @route   POST /api/projects
// @desc    Create and save a new video editing project to the database
router.post('/', async (req, res, next) => {
    try {
        const { projectName, transcription, videoUrl } = req.body;

        if (!transcription) {
            return res.status(400).json({ success: false, error: 'Transcription data is required to save a project.' });
        }

        const newProject = await Project.create({
            projectName: projectName || 'Untitled Project',
            transcription,
            videoUrl
        });

        res.status(201).json({ success: true, data: newProject });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/projects/:id
// @desc    Fetch a specific project to load back into the Canvas Editor
router.get('/:id', async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found.' });
        }

        res.status(200).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/projects/:projectId/regenerate
// @desc    Manually trigger the AI to re-transcribe the video
router.post('/:projectId/regenerate', regenerateTranscription);

export default router;