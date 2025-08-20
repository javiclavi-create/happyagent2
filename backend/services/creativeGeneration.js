// backend/services/creativeGeneration.js
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch'); // Make sure to install node-fetch: npm install node-fetch

// --- Configuration ---
// IMPORTANT: In a real application, use environment variables for API keys.
const API_KEY = ""; // Leave blank, will be handled by the environment
const MODEL_NAME = 'gemini-2.5-flash-preview-05-20';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

const DNA_PATH = path.join(__dirname, '../../config/brand_dna.json');
const EXEMPLARS_PATH = path.join(__dirname, '../../data/exemplars.json');

// --- File System Operations ---

/**
 * Loads the brand DNA from the JSON file.
 * @returns {Promise<Object>} The parsed brand DNA JSON.
 */
const loadDna = async () => {
    try {
        const data = await fs.readFile(DNA_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading brand DNA:", error);
        throw new Error("Could not load brand DNA file.");
    }
};

/**
 * Loads the exemplars from the JSON file.
 * @returns {Promise<Array>} The parsed exemplars JSON.
 */
const loadExemplars = async () => {
    try {
        const data = await fs.readFile(EXEMPLARS_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading exemplars:", error);
        // If the file doesn't exist or is empty, return an empty array
        if (error.code === 'ENOENT') {
            return [];
        }
        throw new Error("Could not load exemplars file.");
    }
};

/**
 * Saves a new exemplar to the JSON file.
 * @param {string} exemplarText - The new ad/brief text to save.
 */
const saveExemplar = async (exemplarText) => {
    try {
        const exemplars = await loadExemplars();
        exemplars.push({
            id: Date.now(), // Simple unique ID
            text: exemplarText
        });
        await fs.writeFile(EXEMPLARS_PATH, JSON.stringify(exemplars, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error saving exemplar:", error);
        throw new Error("Could not save exemplar.");
    }
};

/**
 * Overwrites the brand DNA file with new content.
 * @param {Object} newDna - The new DNA object to save.
 */
const saveDna = async (newDna) => {
    try {
        await fs.writeFile(DNA_PATH, JSON.stringify(newDna, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error saving brand DNA:", error);
        throw new Error("Could not save brand DNA.");
    }
};


// --- Core AI Logic ---

/**
 * Generates a creative brief using the Gemini API.
 * @param {Object} userInput - The user's input ({ product, audience }).
 * @returns {Promise<Object>} The structured JSON brief from the AI.
 */
const generateBrief = async (userInput) => {
    try {
        const dna = await loadDna();
        const exemplars = await loadExemplars();

        const systemPrompt = `You are Happy Face Ads’ creative engine. Your sole purpose is to generate a creative brief in JSON format. Adhere strictly to the brand DNA and study the provided exemplars for style. Output nothing but the JSON object, conforming precisely to the requested schema. Do not include any commentary, pleasantries, or markdown formatting like \`\`\`json.`;

        const userPrompt = `
            Here is the Brand DNA: ${JSON.stringify(dna.voice)}
            Here are examples of our past work: ${JSON.stringify(exemplars)}
            Now, generate a brief for this input: ${JSON.stringify(userInput)}
        `;
        
        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: systemPrompt }, { text: userPrompt }]
            }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: dna.formats.brief
            }
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("API Error Response:", errorBody);
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
            // The response from the API is a string that needs to be parsed into a JSON object
            return JSON.parse(result.candidates[0].content.parts[0].text);
        } else {
            console.error("Unexpected API response structure:", JSON.stringify(result, null, 2));
            throw new Error("Failed to parse brief from AI response.");
        }

    } catch (error) {
        console.error("Error in generateBrief:", error);
        throw error;
    }
};


// --- Public API for Routes ---

module.exports = {
    generateBrief,
    getDna: loadDna,
    updateDna: saveDna,
    addExemplar: saveExemplar,
};

