const { connectToDatabase, pasteDB } = require('./db');
const { createPaste, getPastes } = require('./pasteController');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Redirect root to the specified URL

// Connect to the database and start the server
connectToDatabase().then(() => {
  // Set up middleware and routes
  app.use(express.json());
  
  app.get('/', (req, res) => {
  res.redirect('https://api.alpha-md.rf.gd/');
});
  // Endpoint to create a new paste
  app.get('/paste', createPaste);

  // Endpoint to retrieve stored paste using paste ID
  app.get('/get-paste/:pasteId', getPastes);

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
