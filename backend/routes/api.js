// backend/routes/api.js
const express = 'express';
const router = express.Router();
const {
    generateBrief,
    getDna,
    updateDna,
    addExemplar
} = require('../services/creativeGeneration');

// Route to generate a new creative brief
router.post('/generate', async (req, res) => {
    try {
        const { product, audience } = req.body;
        if (!product || !audience) {
            return res.status(400).json({ error: 'Product and audience are required.' });
        }
        const brief = await generateBrief({ product, audience });
        res.json(brief);
    } catch (error) {
        console.error('Error in /generate route:', error);
        res.status(500).json({ error: 'Failed to generate brief.' });
    }
});

// Route to get the brand DNA
router.get('/dna', async (req, res) => {
    try {
        const dna = await getDna();
        res.json(dna);
    } catch (error) {
        console.error('Error in /dna GET route:', error);
        res.status(500).json({ error: 'Failed to retrieve brand DNA.' });
    }
});

// Route to update the brand DNA
router.post('/dna', async (req, res) => {
    try {
        const newDna = req.body;
        await updateDna(newDna);
        res.status(200).json({ message: 'Brand DNA updated successfully.' });
    } catch (error) {
        console.error('Error in /dna POST route:', error);
        res.status(500).json({ error: 'Failed to update brand DNA.' });
    }
});

// Route to upload a new exemplar ad
router.post('/upload', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text content is required.' });
        }
        await addExemplar(text);
        res.status(200).json({ message: 'Exemplar uploaded successfully.' });
    } catch (error) {
        console.error('Error in /upload route:', error);
        res.status(500).json({ error: 'Failed to upload exemplar.' });
    }
});

module.exports = router;
