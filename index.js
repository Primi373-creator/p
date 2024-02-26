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

// Endpoint to create a new paste
app.post('/paste', async (req, res) => {
  const { content } = req.body;

  if (content) {
    const id = `alpha~${uuidv4()}`;
    const sessionId = uuidv4();
    const prefixedContent = `${id}_${sessionId}_${content}`;

    try {
      await pasteDB.collection('pastes').insertOne({
        _id: id,
        content: prefixedContent,
        sessionId,
      });
      res.json({
        id,
        sessionId,
      });
    } catch (err) {
      console.error('Error creating paste:', err.message);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  } else {
    res.status(400).json({
      error: 'Invalid request. Please provide content in the request body.',
    });
  }
});

// Endpoint to retrieve stored paste using session ID
app.get('/get-paste/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const userPastes = await pasteDB.collection('pastes').find({
      sessionId,
    }).toArray();

    if (userPastes.length > 0) {
      res.json({
        pastes: userPastes.map(paste => paste._id),
      });
    } else {
      res.status(404).json({
        error: 'No pastes found for the provided session ID.',
      });
    }
  } catch (err) {
    console.error('Error retrieving pastes:', err.message);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Connect to the database and start the server
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
