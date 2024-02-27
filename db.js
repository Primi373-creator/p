const { MongoClient } = require('mongodb');

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

module.exports = { connectToDatabase, pasteDB };
