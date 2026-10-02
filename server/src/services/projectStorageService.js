import cloudinary from '../config/cloudinary.js';

// Uploads a local video file to Cloudinary so it survives past this request/
// deploy (the server's local disk is temporary). Returns the durable URL +
// public_id (the id is needed later to delete the asset if the project is removed).
export const uploadProjectVideo = async (localFilePath) => {
    const result = await cloudinary.uploader.upload(localFilePath, {
        resource_type: 'video',
        folder: 'caption-crow/projects',
    });
    return { url: result.secure_url, publicId: result.public_id };
};

export const deleteProjectVideo = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    } catch (error) {
        console.error('[Cloudinary] Failed to delete video asset:', error.message);
    }
};
