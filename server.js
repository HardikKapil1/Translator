// server.js
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai'; 

dotenv.config(); 
const app = express();
const PORT = 3001; 

app.use(cors()); 
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

app.post('/api/translate', async (req, res) => {
    const { textToTranslate, targetLanguage } = req.body;

    if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ error: "Server error: Gemini API key is missing. Check your .env file." });
    }

    const prompt = `You are a professional translator. Translate the following English text into ${targetLanguage}. Only provide the translated text as the output, do not add any extra commentary or explanations. English Text: "${textToTranslate}" ${targetLanguage} Translation:`;

    const model = "gemini-2.5-flash"; 

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                temperature: 0.7, 
                maxOutputTokens: 150,
            }
        });

        // --- FIX IMPLEMENTATION START ---
        let translatedText = '';

        // Check 1: Ensure the response object has the 'text' property
        if (response.text) {
            translatedText = response.text.trim();
        } else {
            // Check 2: If 'text' is missing, throw a controlled error.
            throw new Error("Model response was empty. The content might have been blocked or the request failed.");
        }
        // --- FIX IMPLEMENTATION END ---

        res.json({ translation: translatedText });

    } catch (error) {
        console.error("Translation API error:", error.message);
        // The front-end receives a clean 500 error with the specific message.
        res.status(500).json({ error: `Translation failed due to API error. Details: ${error.message}` });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Translation Server (Gemini) running on http://localhost:${PORT}`);
});