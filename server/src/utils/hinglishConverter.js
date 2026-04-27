import Groq from "groq-sdk";
import { transliterate } from 'transliteration';

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Helper function to pause execution (for retries)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const convertToHinglish = async (transcriptionArray, maxRetries = 3) => {
    if (!transcriptionArray || transcriptionArray.length === 0) return [];

    console.log(`\n-----------------------------------------`);
    console.log(`🚀 [Groq Hybrid] Converting ${transcriptionArray.length} words to lowercase Hinglish...`);

    const systemPrompt = `
    You are a strict Devanagari-to-Hinglish transliteration engine. 
    Convert any Hindi text into natural, modern internet Hinglish (e.g., "एक" -> "ek", "यहाँ" -> "yahan", "चीज" -> "cheez").
    DO NOT translate the meaning.
    Leave existing English words completely alone.
    Return ONLY a JSON object containing a "data" array with the converted objects. Keep 'start' and 'end' intact.
    `;

    // Try Groq AI with an Exponential Backoff Retry Loop
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`⏳ [Attempt ${attempt}/${maxRetries}] Asking Groq (Llama-3 70B)...`);
            
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: JSON.stringify({ data: transcriptionArray }) }
                ],
                model: "llama-3.3-70b-versatile", // Massive, highly intelligent model (free on Groq)
                temperature: 0.1,
                response_format: { type: "json_object" } 
            });

            // Extract the response
            const responseContent = chatCompletion.choices[0].message.content;
            let parsedResponse = JSON.parse(responseContent);
            let finalArray = parsedResponse.data || [];

            // Fallback array extraction just in case the AI names the array differently
            if (!Array.isArray(finalArray)) {
                const firstArrayKey = Object.keys(parsedResponse).find(key => Array.isArray(parsedResponse[key]));
                finalArray = firstArrayKey ? parsedResponse[firstArrayKey] : transcriptionArray;
            }
            
            // 👇 FORCE STRICT LOWERCASE ON EVERY SINGLE WORD 👇
            finalArray = finalArray.map(wordObj => ({
                ...wordObj,
                word: (wordObj.word || wordObj.text || "").toLowerCase()
            }));

            console.log(`✅ [Groq] SUCCESS on attempt ${attempt}!`);
            console.log(`-----------------------------------------\n`);
            return finalArray;

        } catch (error) {
            console.error(`❌ [Attempt ${attempt} Failed]:`, error.message);
            
            if (attempt === maxRetries) {
                console.log(`⚠️ Groq failed 3 times. Activating Local Fallback...`);
                break; // Exit the loop and drop down to the local fallback
            }

            const waitTime = attempt * 2000;
            console.log(`⏱️ Waiting ${waitTime/1000} seconds before retrying...`);
            await delay(waitTime);
        }
    }

    // ULTIMATE FALLBACK: If Groq ever fails completely, process it locally
    console.log(`⚙️ [Local Converter] Processing words locally...`);
    const fallbackArray = transcriptionArray.map((wordObj) => {
        const rawWord = wordObj.word || wordObj.text || "";
        return {
            ...wordObj,
            // STRICT LOWERCASE ON THE LOCAL FALLBACK
            word: transliterate(rawWord).toLowerCase() 
        };
    });
    
    console.log(`✅ [Local Converter] Successfully applied local safety net.`);
    console.log(`-----------------------------------------\n`);
    
    return fallbackArray;
};