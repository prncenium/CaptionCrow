import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vartaLab_default_secret_change_me';
const JWT_EXPIRES = '30d';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const issueAuthResponse = (res, status, user) => {
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.status(status).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email }
    });
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        }

        const hashed = await bcrypt.hash(password, 12);
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashed
        });

        issueAuthResponse(res, 201, user);
    } catch (error) {
        console.error('[Auth] Register error:', error.message);
        res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        if (!user.password) {
            return res.status(401).json({ success: false, message: 'This account uses Google Sign-In. Please continue with Google.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        issueAuthResponse(res, 200, user);
    } catch (error) {
        console.error('[Auth] Login error:', error.message);
        res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
    }
};

export const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ success: false, message: 'Missing Google credential.' });
        }
        if (!GOOGLE_CLIENT_ID) {
            console.error('[Auth] GOOGLE_CLIENT_ID is not set on the server.');
            return res.status(500).json({ success: false, message: 'Google sign-in is not configured on the server.' });
        }

        const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, email_verified: emailVerified } = payload;

        if (!emailVerified) {
            return res.status(401).json({ success: false, message: 'Google email is not verified.' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        let user = await User.findOne({ $or: [{ googleId }, { email: normalizedEmail }] });

        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            user = await User.create({
                name: name || normalizedEmail.split('@')[0],
                email: normalizedEmail,
                googleId,
            });
        }

        issueAuthResponse(res, 200, user);
    } catch (error) {
        console.error('[Auth] Google auth error:', error.message);
        res.status(401).json({ success: false, message: 'Google sign-in failed. Please try again.' });
    }
};
