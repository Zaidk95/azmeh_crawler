const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const input = require('input'); // npm install input
const Parse = require('parse/node');

Parse.initialize("gs38GspkzojXwy0REuqmrGVcBdwIdzqwAURPKGyZ", "2mY8CXItZGCos2cArjFGkbzhGW8LMaoJQzYYkG6z");
Parse.serverURL = 'https://parseapi.back4app.com';

const apiId = 22936363; // Your API ID
const apiHash = '86c3044a784370034e29370c5016b7a1'; // Your API Hash
const sessionFilePath = 'session.json';

// Read session string from file or use an empty string if the file doesn't exist
const sessionString = fs.existsSync(sessionFilePath) ? fs.readFileSync(sessionFilePath, 'utf8') : '';
const stringSession = new StringSession(sessionString);

const app = express();
app.use(cors());

let client;
let isConnected = false;

// Function to connect to Telegram
const connectClient = async () => {
  try {
    console.log('Connecting to Telegram...');
    client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    });

    if (!sessionString) {
      await client.start({
        phoneNumber: '972527346155',
        phoneCode: async () => await input.text('Please enter the code you received: '),
        onError: (err) => console.log(err),
      });
      console.log('You should now be connected.');

      // Save session string to file
      const savedSession = client.session.save();
      fs.writeFileSync(sessionFilePath, savedSession);
      console.log('Session saved to session.json');
    } else {
      await client.connect();
      console.log('Connected using saved session.');
    }
    isConnected = true;
  } catch (error) {
    console.error('Failed to connect to Telegram:', error);
    isConnected = false;
  }
};
//funcs 
//funcs 
//funcs 
//funcs 
//funcs 
//funcs 
async function getPrediction(sentence) {
  const response = await fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sentence: sentence })
  });

  if (!response.ok) {
      throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data;
}
async function addObjectToClass(className, objectData) {
  const ParseObject = Parse.Object.extend(className);
  const newObject = new ParseObject();

  // Set the fields of the object
  for (const key in objectData) {
    if (objectData.hasOwnProperty(key)) {
      newObject.set(key, objectData[key]);
    }
  }

  try {
    const savedObject = await newObject.save();
    console.log('New object created with objectId: ' + savedObject.id);
    return savedObject;
  } catch (error) {
    console.error('Failed to create new object, with error code: ' + error.message);
    throw error;
  }
}
const getCheckpointPointer = async(nameContains)=> {
  const UpdateClass = Parse.Object.extend('Checkpoint');
  const query = new Parse.Query(UpdateClass);
  query.contains('name', nameContains);
  try {
    const arr = await query.find();
      return arr[0];
  } catch (error) {
      console.error('Error while fetching updates:', error);
      throw error;  // Rethrow the error if something goes wrong
  }
}
// Example usage
async function processPrediction(sentence , extractedAt) {
  try {
    const data = await getPrediction(sentence);
    const pointerToCheckpoint = await getCheckpointPointer(data.checkpoint_name);
    const geoPoint = new Parse.GeoPoint({
      latitude: -1,
      longitude: -1
    });
    const predictionData = {
      checkpoint: pointerToCheckpoint,
      status: data.status,
      type: data.type,
      source: data.sentence,
      third_party: true,
      location: geoPoint, 
      approved: 0,
      extractedAt:extractedAt
    };
    
    await addObjectToClass("TestUpdate", predictionData);
  } catch (error) {
    console.error('Error:', error);
  }
}



//funcs
//funcs
//funcs
//funcs
//funcs

// Connect to Telegram
connectClient();

// Route to fetch messages from Telegram
app.get('/', async (req, res) => {
  if (!isConnected) {
    return res.status(500).json({ error: 'Not connected to Telegram' });
  }

  try {
    const group = await client.getEntity('https://t.me/ahwalaltreq');
    const now = new Date();
    const specificDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); // Today in UTC
    const myHour = now.getUTCHours() + 3; // Past hour in UTC
    const messages = [];

    // Iterate through the messages
    for await (const message of client.iterMessages(group)) {
      const messageDate = new Date(message.date * 1000); // Assuming message.date is a Unix timestamp
      const messageDateUtcPlus3 = new Date(messageDate.getTime() + 3 * 60 * 60 * 1000); // Convert the message date to UTC+3

      if (
        messageDateUtcPlus3.getUTCFullYear() === specificDate.getUTCFullYear() &&
        messageDateUtcPlus3.getUTCMonth() === specificDate.getUTCMonth() &&
        messageDateUtcPlus3.getUTCDate() === specificDate.getUTCDate()
      ) {
        const messageHour = messageDateUtcPlus3.getUTCHours();

        if (messageHour === myHour) {
          const dateOnlyString = messageDateUtcPlus3.toISOString();
          const dateOnly = new Date(dateOnlyString);
          await processPrediction(message.message, dateOnly);
          messages.push({ message: message.message, date: dateOnly });
          //console.log(messages[messages.length-1]);
        }
        if (messageHour < myHour) {
          console.log("No More Masseges " + messageHour);
          break;
        }
      }
    }

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
