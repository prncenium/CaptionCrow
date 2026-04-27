import { groq } from '../config/groq.js';
import fs from 'fs';

export const transcribeAudioWordLevel = async (audioFilePath) => {
    const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: 'whisper-large-v3',
        response_format: 'verbose_json',
        timestamp_granularities: ['word'],
    });

    return transcription.words; // We only return the specific array needed for the React Canvas
};