// index.js
const translateBtn = document.getElementById('translate-btn');
const textInput = document.getElementById('text-input');
const translationOutput = document.getElementById('translation-output');

// The port where your Express server is running
const SERVER_URL = '/api/translate';

translateBtn.addEventListener('click', translateText);

async function translateText() {
    const textToTranslate = textInput.value.trim();
    if (!textToTranslate) {
        alert("Please enter text to translate.");
        return;
    }

    // 1. Get the selected target language
    const targetLanguage = document.querySelector('input[name="target-lang"]:checked').value;

    try {
        translationOutput.value = `Translating to ${targetLanguage} via server...`; 

        // Call your secure server endpoint
        const response = await fetch(SERVER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                textToTranslate: textToTranslate,
                targetLanguage: targetLanguage
            }),
        });

        if (!response.ok) {
             // Handle error response from your Express server
            const errorData = await response.json();
            throw new Error(errorData.error || response.statusText);
        }

        const data = await response.json();

        // Core Requirement: Render the completion
        if (data.translation) {
            translationOutput.value = data.translation;
        } else {
            translationOutput.value = "Translation failed: Server returned no data.";
        }

    } catch (error) {
        console.error("Translation error:", error);
        // Core Requirement: Handle errors
        translationOutput.value = `Error: ${error.message}`;
    }
}