import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    projectName: { 
        type: String, 
        default: 'Untitled Project' 
    },
    transcription: { 
        type: Array, 
        required: true 
    }, // Stores the [{word: "kaise", start: 1.2, end: 1.8}] object
    videoUrl: { 
        type: String 
    }, // For later when you integrate AWS S3 / Cloudinary
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

export default mongoose.model('Project', projectSchema);