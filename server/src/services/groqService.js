import { groq } from '../config/groq.js';
import fs from 'fs';

export const transcribeAudioWordLevel = async (audioFilePath) => {
    const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: 'whisper-large-v3',
        response_format: 'verbose_json',
        timestamp_granularities: ['word'],
    });

    return transcription.words; 
};

// 🚨 NEW: The AI Intelligence Layer that detects important words
export const analyzeTranscriptForHighlights = async (fullText) => {
    const systemPrompt = `You are an expert short-form video caption editor. Your job is to select words to highlight in yellow for maximum viewer retention and visual punch.

TARGET FREQUENCY: Emphasize roughly 1 out of every 5 words. Do not clump — spread highlights evenly through the transcript.

ALWAYS SELECT:
- Strong action verbs: build, destroy, earn, launch, broke, win, grind, hit, scale, quit, fail, crush, dominate, grow
- Power nouns: money, life, truth, secret, mistake, problem, system, result, proof, deal, risk, game
- Strong adjectives: massive, biggest, worst, insane, real, exact, raw, brutal, free, zero, full
- Numbers and stats: any digit, percentage, dollar amount, time duration
- Proper nouns: brand names, city names, person names
- Emotional impact words: never, always, finally, literally, actually, exactly, only

NEVER SELECT:
- Articles: a, an, the
- Conjunctions: and, but, or, so, yet, nor
- Prepositions: in, on, at, to, of, with, by, for, from, into, through, about
- Pronouns: I, you, he, she, it, we, they, me, him, her, us, them, my, your, our
- Weak auxiliary verbs: is, are, was, were, have, has, had, do, does, did, will, would, can, could, may, might, should, be, been, being
- Filler words: just, like, very, really, kind, sort, thing, stuff, way, got, get

If the transcript has 20 words, return roughly 4 highlighted words. If it has 50 words, return roughly 10.

Return ONLY a plain JSON array of unique lowercase strings. No explanation. No markdown. Example: ["build", "million", "insane", "secret", "quit"]`;

    try {
        const response = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Transcript: ${fullText}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
        });

        const content = response.choices[0].message.content.trim();
        
        // 🚨 DEBUG LOG 1: Let's see exactly what the AI generated
        console.log("🤖 RAW LLAMA OUTPUT:", content);
        
        // Failsafe regex to grab just the array in case LLaMA adds text
        const jsonArrayMatch = content.match(/\[.*\]/s); 
        if (jsonArrayMatch) {
            const parsedArray = JSON.parse(jsonArrayMatch[0]);
            
            // 🚨 DEBUG LOG 2: Let's confirm it parsed successfully
            console.log("✅ PARSED HIGHLIGHTS:", parsedArray);
            
            return parsedArray;
        }
        
        console.log("⚠️ NO JSON ARRAY MATCHED");
        return [];
    } catch (error) {
        console.error("AI Highlight Analysis Failed:", error);
        return []; // Return empty array so the app doesn't crash
    }
};

// 🚨 NEW: The AI Intelligence Layer that finds natural phrase/sentence boundaries,
// so caption cards break where a person would naturally pause instead of at a raw
// character-count cutoff — and flags which phrases complete a full sentence/thought
// (used to decide whether a Viral Slide Up card needs a second line at all).
export const analyzeTranscriptForChunking = async (fullText) => {
    const systemPrompt = `You are an expert short-form video caption editor. Split the transcript into natural spoken phrases — the same way a person would pause while speaking, or how you'd break a sentence into readable caption chunks.

RULES:
- Preserve every word EXACTLY as given, in the same order. Do not add, remove, reword, fix spelling, or fix grammar.
- Break at natural grammatical boundaries: end of a clause, end of a sentence, before a conjunction that starts a new thought, after a comma pause, etc.
- Each phrase should typically be 2-8 words. Never exceed ~10 words in one phrase.
- For each phrase, set "sentenceEnd": true if it completes a full sentence or a complete standalone thought (a natural full stop, or a strong comma pause after a complete clause). Set "sentenceEnd": false if the phrase is a fragment or setup that naturally continues into the next phrase as part of the same sentence.

Return ONLY a JSON array of objects, covering the ENTIRE transcript with no words skipped or duplicated. No explanation. No markdown.
Example: [{"text": "so I built this app", "sentenceEnd": false}, {"text": "and it made me six figures", "sentenceEnd": true}]`;

    try {
        const response = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Transcript: ${fullText}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
        });

        const content = response.choices[0].message.content.trim();
        console.log("🤖 RAW CHUNKING OUTPUT:", content);

        // Failsafe regex to grab just the array in case LLaMA adds text
        const jsonArrayMatch = content.match(/\[.*\]/s);
        if (jsonArrayMatch) {
            const parsedArray = JSON.parse(jsonArrayMatch[0]);
            console.log("✅ PARSED PHRASE BREAKS:", parsedArray);
            return parsedArray;
        }

        console.log("⚠️ NO JSON ARRAY MATCHED FOR CHUNKING");
        return [];
    } catch (error) {
        console.error("AI Chunking Analysis Failed:", error);
        return []; // Return empty array so chunking falls back to the mechanical char-count logic
    }
};