import jwt from 'jsonwebtoken';

// Must match the secret used to sign tokens in authController.js.
const JWT_SECRET = process.env.JWT_SECRET || 'vartaLab_default_secret_change_me';

// Requires a valid "Authorization: Bearer <token>" header. Attaches req.userId
// on success; responds 401 otherwise. Use on any route that reads/writes data
// scoped to a specific logged-in user (e.g. saved projects).
export const protect = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Please sign in to continue.' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.userId;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Your session has expired. Please sign in again.' });
    }
};
