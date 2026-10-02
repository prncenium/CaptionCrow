import path from 'path';
import Project from '../models/Project.js';
import { uploadProjectVideo, deleteProjectVideo } from '../services/projectStorageService.js';

const tempDir = path.resolve('temp_uploads');

// @route   POST /api/projects
// @desc    Save the current editor state as a new resumable project. The video
// must already be sitting in temp_uploads (from the initial /upload transcribe
// step) — this uploads THAT file to Cloudinary so it survives past this session.
export const createProject = async (req, res, next) => {
    try {
        const {
            videoFilename, videoName, transcription,
            timelineBlocks, activeStyle, lineStyles,
            globalLineOffsets, aiHighlights, rawAiHighlights, aiPhraseBreaks
        } = req.body;

        if (!videoFilename || !transcription) {
            return res.status(400).json({ success: false, error: 'videoFilename and transcription are required.' });
        }

        const localVideoPath = path.join(tempDir, videoFilename);
        const { url, publicId } = await uploadProjectVideo(localVideoPath);

        const project = await Project.create({
            userId: req.userId,
            projectName: videoName || 'Untitled Project',
            videoName: videoName || 'Untitled Video',
            transcription,
            videoUrl: url,
            videoPublicId: publicId,
            presetId: activeStyle?.id,
            timelineBlocks: timelineBlocks || [],
            activeStyle: activeStyle || {},
            lineStyles: lineStyles || [],
            globalLineOffsets: globalLineOffsets || {},
            aiHighlights: aiHighlights || [],
            rawAiHighlights: rawAiHighlights || [],
            aiPhraseBreaks: aiPhraseBreaks || [],
        });

        res.status(201).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/projects/:id
// @desc    Autosave: update caption/style state on an existing project. Never
// re-uploads the video — only the lightweight editable fields change here.
export const updateProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found.' });
        }
        if (project.userId.toString() !== req.userId) {
            return res.status(403).json({ success: false, error: 'You do not have access to this project.' });
        }

        const editableFields = [
            'transcription', 'timelineBlocks', 'activeStyle', 'lineStyles',
            'globalLineOffsets', 'aiHighlights', 'rawAiHighlights', 'aiPhraseBreaks',
            'status', 'projectName'
        ];
        editableFields.forEach((field) => {
            if (req.body[field] !== undefined) project[field] = req.body[field];
        });
        if (req.body.activeStyle?.id) project.presetId = req.body.activeStyle.id;

        await project.save();
        res.status(200).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/projects
// @desc    List the logged-in user's projects (lightweight — for the My Edits grid)
export const listProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ userId: req.userId })
            .select('projectName videoName videoUrl presetId status createdAt updatedAt')
            .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, data: projects });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/projects/:id
// @desc    Fetch one project in full, to resume it in the editor
export const getProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found.' });
        }
        if (project.userId.toString() !== req.userId) {
            return res.status(403).json({ success: false, error: 'You do not have access to this project.' });
        }

        res.status(200).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/projects/:id
export const deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found.' });
        }
        if (project.userId.toString() !== req.userId) {
            return res.status(403).json({ success: false, error: 'You do not have access to this project.' });
        }

        await deleteProjectVideo(project.videoPublicId);
        await project.deleteOne();

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};
