const express = require('express');
const { v4: uuidv4 } = require('uuid');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const PORT = process.env.PORT || 3000;
const PASTE_DB_URI = 'mongodb+srv://pobasuyi69:9UW3Yra6HZFUCT0B@cluster0.lum7yrw.mongodb.net/?retryWrites=true&w=majority';
const PASTE_DB_NAME = 'pasteDB';
let pasteDB;

async function connectToDatabase() {
  try {
    const pasteClient = await MongoClient.connect(PASTE_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    pasteDB = pasteClient.db(PASTE_DB_NAME);
    console.log('Connected to the database');
  } catch (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1);
  }
}

app.use(express.json());

app.get('/admin/get-paste/:pasteId', async (req, res) => {
  const { pasteId } = req.params;

  try {
    const paste = await pasteDB.collection('pastes').findOne({
      _id: pasteId,
    });

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
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

app.get('/admin/paste', async (req, res) => {
  const { content } = req.query;

  if (content) {
    const id = `alpha~${uuidv4()}`;

    try {
      await pasteDB.collection('pastes').insertOne({
        _id: id,
        content,
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
    res.status(400).json({
      error: 'Invalid request. Please provide content in the query parameters.',
    });
  }
});
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
