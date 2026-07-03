import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Not required: Google-signup accounts have no password.
    password: { type: String },
    googleId: { type: String, unique: true, sparse: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
