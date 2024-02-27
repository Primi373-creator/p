const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser'); 
const MongoClient = require('mongodb').MongoClient;
const app = express();
const PORT = process.env.PORT || 3000;
const PASTE_DB_URI = 'mongodb+srv://alpha:alphaadmin@cluster0.5crubuu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const PASTE_DB_NAME = 'pasteDB';
const ACCESS_KEY = 'alpha'; // Define the access key
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
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/admin/clear-paste/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle POST request to clear the database
app.post('/admin/clear-paste/', (req, res) => {
  const { accessKey } = req.body;

  if (accessKey === ACCESS_KEY) {
    // Clear the entire database
    pasteDB.collection('pastes').deleteMany({})
      .then(() => {
        console.log('Database cleared successfully.');
        res.send('Database cleared successfully.');
      })
      .catch((error) => {
        console.error('Error clearing database:', error.message);
        res.status(500).send('Internal server error');
      });
  } else {
    res.status(401).send('Unauthorized');
  }
});
// Middleware to check access key
function checkAccessKey(req, res, next) {
  const providedKey = req.query.apikey;

  if (providedKey === ACCESS_KEY) {
    next(); // Key is valid, proceed
  } else {
    res.status(401).json({
      error: 'Unauthorized. Invalid access key.',
    });
  }
}

// Redirect root path to 'https://api.alpha-md.rf.gd/'
app.get('/', (req, res) => {
  res.redirect('https://api.alpha-md.rf.gd/');
});

// Admin endpoint to retrieve a paste by ID with key requirement
app.get('/admin/get-paste/:pasteId', checkAccessKey, async (req, res) => {
  const { pasteId } = req.params;

  try {
    const paste = await pasteDB.collection('pastes').findOne({
      _id: pasteId,
    });

    if (paste) {
      res.json({
        id: paste._id,
        content: paste.content,
        author: 'cipher',
        bot: 'alpha-md',
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

// Admin endpoint to create a new paste with key requirement
app.get('/admin/paste', checkAccessKey, async (req, res) => {
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
        author: 'cipher',
        bot: 'alpha-md',
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

// Connect to the database and start the server
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
