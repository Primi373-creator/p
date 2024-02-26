const express = require('express');
const CharacterAI = require('node_characterai');

const app = express();
const port = 3000; // You can use any port you prefer

const characterAI = new CharacterAI();

app.get('/api/chat', async (req, res) => {
  try {
    const { text, characterId } = req.query;

    if (!text || !characterId) {
      return res.status(400).json({ error: 'Both "text" and "characterId" are required query parameters.' });
    }

    await characterAI.authenticateWithToken('ca9753a451e4563e118350d99c60a0399be1ff8a');

    const chat = await characterAI.createOrContinueChat(characterId);
    const response = await chat.sendAndAwaitResponse(text, true);

    res.json({ text: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
