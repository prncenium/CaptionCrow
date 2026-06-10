import { analyzeTranscriptForHighlights } from '../services/groqService.js';

export const refreshHighlights = async (req, res, next) => {
    try {
        const { transcriptText } = req.body;
        if (!transcriptText || !transcriptText.trim()) {
            return res.status(400).json({ success: false, error: 'transcriptText is required' });
        }
        const aiHighlights = await analyzeTranscriptForHighlights(transcriptText);
        res.status(200).json({ success: true, aiHighlights });
    } catch (error) {
        next(error);
    }
};
