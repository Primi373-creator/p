// pasteController.js

const { v4: uuidv4 } = require('uuid');
const { connectToDatabase, pasteDB } = require('./db');

async function createPaste(req, res) {
  const { content } = req.query;

  if (content) {
    // Create a unique ID for the paste
    const id = `alpha_${uuidv4()}`;
    const prefixedContent = `${id}_${content}`;

    try {
      // Ensure pasteDB is initialized
      await connectToDatabase();

      await pasteDB.collection('pastes').insertOne({
        _id: id,
        content: prefixedContent,
      });

      res.json({
        id,
      });
    } catch (err) {
      console.error('Error creating paste:', err.message);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  } else {
    res.status(400).json({ error: 'Invalid request. Please provide content parameter.' });
  }
}

async function getPastes(req, res) {
  const { pasteId } = req.params;

  try {
    // Ensure pasteDB is initialized
    await connectToDatabase();

    const paste = await pasteDB.collection('pastes').findOne({ _id: pasteId });

    if (paste) {
      res.json({
        id: paste._id,
        content: paste.content,
      });
    } else {
      res.status(404).json({
        error: 'Paste not found.',
      });
    }
  } catch (err) {
    console.error('Error retrieving paste:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createPaste, getPastes };
