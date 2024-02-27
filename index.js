const { connectToDatabase } = require('./db');
const { createPaste, getPastes } = require('./pasteController');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
connectToDatabase().then(() => {
  app.use(express.json());
  app.get('/paste', createPaste);
  app.get('/get-paste/:pasteId', getPastes);
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
