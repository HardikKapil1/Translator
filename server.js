// server.js
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai'; 

dotenv.config(); 
const app = express();
const PORT = 3001; // The port the server will run on

app.use(cors()); 
app.use(express.json());

// Initialize the Gemini client using the key from the .env file
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

app.post('/api/translate', async (req, res) => {
    // Data destructured from the front-end request
    const { textToTranslate, targetLanguage } = req.body;

    // 🔑 Security Check
    if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ error: "Server error: Gemini API key is missing. Check your .env file." });
    }

    // --- Core Requirement: Prompt Engineering ---
    const prompt = `You are a professional translator. Translate the following English text into ${targetLanguage}. Only provide the translated text as the output, do not add any extra commentary or explanations. English Text: "${textToTranslate}" ${targetLanguage} Translation:`;

    const model = "gemini-2.5-flash"; // Core Requirement: Select a Model

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                temperature: 0.7,     // Core Requirement: Use temperature
                maxOutputTokens: 150, // Core Requirement: Use max_tokens
            }
        });

        // Core Requirement: Render the completion
        const translatedText = response.text.trim();
        res.json({ translation: translatedText });

    } catch (error) {
        console.error("Translation API error:", error.message);
        res.status(500).json({ error: `Translation failed due to API error. Details: ${error.message}` });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Translation Server (Gemini) running on http://localhost:${PORT}`);
});