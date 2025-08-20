// backend/server.js
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// --- THE FIX IS HERE ---
// More specific CORS configuration to allow requests from your Vercel app
const corsOptions = {
  origin: "https://happyagent2.vercel.app", // This is your Vercel URL
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
// --- END OF FIX ---

// Middleware
app.use(express.json()); // Parse JSON bodies

// API Routes
app.use('/api', apiRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
