// backend/server.js
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
// THE FIX IS HERE: We tell the app to use Render's port first.
const PORT = process.env.PORT || 3001; 

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies

// API Routes
app.use('/api', apiRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
