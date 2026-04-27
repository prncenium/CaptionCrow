export const errorHandler = (err, req, res, next) => {
    console.error(`[Server Error] ${err.message}`);
    
    // Multer-specific error handling
    if (err.name === 'MulterError') {
        return res.status(400).json({ success: false, error: `Upload Error: ${err.message}` });
    }

    const status = err.status || 500;
    res.status(status).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
};