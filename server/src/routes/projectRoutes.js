import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { regenerateTranscription } from '../controllers/transcriptionController.js';
import {
    createProject,
    updateProject,
    listProjects,
    getProject,
    deleteProject,
} from '../controllers/projectController.js';

const router = express.Router();

// All project routes require a logged-in user — a project always belongs to
// exactly one account, and ownership is re-checked per-request in the controller.
router.use(protect);

// @route   POST /api/projects
// @desc    Save the current editor session as a new resumable project
router.post('/', createProject);

// @route   GET /api/projects
// @desc    List the logged-in user's saved projects (for the My Edits page)
router.get('/', listProjects);

// @route   GET /api/projects/:id
// @desc    Fetch a specific project to load back into the editor
router.get('/:id', getProject);

// @route   PUT /api/projects/:id
// @desc    Autosave caption/style edits onto an existing project
router.put('/:id', updateProject);

// @route   DELETE /api/projects/:id
router.delete('/:id', deleteProject);

// @route   POST /api/projects/:projectId/regenerate
// @desc    Manually trigger the AI to re-transcribe the video
router.post('/:projectId/regenerate', regenerateTranscription);

export default router;
