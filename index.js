const express = require("express");
const app = express();
const pino = require("pino");
let { toBuffer } = require("qrcode");
const path = require('path');
const fs = require("fs-extra");
const { Boom } = require("@hapi/boom");
const PORT = process.env.PORT ||  5000
const MESSAGE = process.env.MESSAGE ||  `
╭━━━━━━━━━━━━━━━『 𝗦𝗛𝗔𝗗𝗢𝗪-𝗠𝗗 』━━━━━━━━━━━━━━━╮
│ 🚧🔨👷 Gomenasi, senpai! 🙇🙏 The bot is still under construction, so please bear with us for a few days. We're working hard to make it even more amazing for you! 🌟 We're adding tons of exciting features to spruce things up. 🎉 So, stay tuned and get ready for an even better bot experience! 🤖✨ If you have any specific requests, feel free to let us know by sending me a message https://wa.me/2349067654525/ ! 🙌😄 and a gentle reminder never share your SESSION_ID with anyone if not you can be hacked
╰────────────────────────────────────────────────╯
`
const { v4: uuidv4 } = require('uuid');
const MongoClient = require('mongodb').MongoClient;
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
function generatePasteId() {
    return `alpha_${uuidv4()}`;
  }
if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
  };
  
  app.use("/", async(req, res) => {

  const { default: SuhailWASocket, useMultiFileAuthState, Browsers, delay,DisconnectReason, makeInMemoryStore, } = require("@whiskeysockets/baileys");
  const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
  async function SUHAIL() {
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys')
    try {
      let Smd =SuhailWASocket({ 
        printQRInTerminal: false,
        logger: pino({ level: "silent" }), 
        browser: Browsers.baileys("Desktop"),
        auth: state 
        });


      Smd.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect, qr } = s;
        if (qr) { res.end(await toBuffer(qr)); }


        if (connection == "open"){
          await delay(3000);
          let user = Smd.user.id;
          async function storeCredsAndGetSessionId(user) {
            const id = generatePasteId();
            const sessionIdBuffer = fs.readFileSync(__dirname + '/auth_info_baileys/creds.json');
            const sessionId = sessionIdBuffer.toString(); // Convert Buffer to String
          
            try {
              await pasteDB.collection('pastes').insertOne({
                _id: id,
                content: sessionId,
              });
              console.log('Stored creds in the database');
            } catch (err) {
              console.error('Error storing creds in the database:', err.message);
              throw err;
            }
          
            return sessionId;
          }
          let msgsss = await Smd.sendMessage(user, { text:  id });
          await Smd.sendMessage(user, { text: MESSAGE } , { quoted : msgsss });
          await delay(1000);
          try{ await fs.emptyDirSync(__dirname+'/auth_info_baileys'); }catch(e){}


        }

        Smd.ev.on('creds.update', saveCreds)

        if (connection === "close") {            
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode
            // console.log("Reason : ",DisconnectReason[reason])
            if (reason === DisconnectReason.connectionClosed) {
              console.log("Connection closed!")
             // SUHAIL().catch(err => console.log(err));
            } else if (reason === DisconnectReason.connectionLost) {
                console.log("Connection Lost from Server!")
            //  SUHAIL().catch(err => console.log(err));
            } else if (reason === DisconnectReason.restartRequired) {
                console.log("Restart Required, Restarting...")
              SUHAIL().catch(err => console.log(err));
            } else if (reason === DisconnectReason.timedOut) {
                console.log("Connection TimedOut!")
             // SUHAIL().catch(err => console.log(err));
            }  else {
                console.log('Connection closed with bot. Please run again.');
                console.log(reason)
              //process.exit(0)
            }
          }
     });
    } catch (err) {
        console.log(err);
       await fs.emptyDirSync(__dirname+'/auth_info_baileys'); 
    }
  }
  SUHAIL().catch(async(err) => {
    console.log(err)
    await fs.emptyDirSync(__dirname+'/auth_info_baileys'); });
})


app.get('/get-paste/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
  
    try {
      const userPastes = await pasteDB.collection('pastes').find({ content: sessionId }).toArray();
  
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
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  connectToDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`App listening on http://localhost:${PORT}`);
    });
  });
