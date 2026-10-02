import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    projectName: {
        type: String,
        default: 'Untitled Project'
    },
    videoName: {
        type: String,
        default: 'Untitled Video'
    },
    transcription: {
        type: Array,
        required: true
    }, // [{word: "kaise", start: 1.2, end: 1.8, isEmphasized, color}]
    videoUrl: {
        type: String,
        required: true
    }, // Cloudinary-hosted video URL — the durable copy used to resume editing
    videoPublicId: {
        type: String
    }, // Cloudinary public_id, needed to delete the asset when the project is deleted

    // Denormalized from activeStyle.id — lets the My Edits list show a preset
    // badge without fetching the full (heavier) activeStyle blob per project.
    presetId: { type: String },

    // Everything needed to fully re-hydrate the editor on resume
    timelineBlocks: { type: Array, default: [] },
    activeStyle: { type: mongoose.Schema.Types.Mixed, default: {} },
    lineStyles: { type: Array, default: [] },
    globalLineOffsets: { type: mongoose.Schema.Types.Mixed, default: {} },
    aiHighlights: { type: Array, default: [] },
    rawAiHighlights: { type: Array, default: [] },
    aiPhraseBreaks: { type: Array, default: [] },

    status: {
        type: String,
        enum: ['editing', 'exported'],
        default: 'editing'
    },
}, { timestamps: true }); // adds createdAt + updatedAt automatically

export default mongoose.model('Project', projectSchema);