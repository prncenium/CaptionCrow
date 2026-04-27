import multer from 'multer';
import path from 'path';
import fs from 'fs'; // NEW: Using Node's native 'fs' here instead of 'fs-extra'

const tempDir = path.resolve('temp_uploads');

// NEW: Bulletproof folder creation. 
// It checks if it exists first, and uses { recursive: true } to prevent EEXIST crashes.
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, tempDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 1024 }, // Strict 1GB hard limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) cb(null, true);
        else cb(new Error('Invalid format: Only video files are allowed.'), false);
    }
});