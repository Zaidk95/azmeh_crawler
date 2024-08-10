const Parse = require("parse/node");

Parse.initialize("gs38GspkzojXwy0REuqmrGVcBdwIdzqwAURPKGyZ", "2mY8CXItZGCos2cArjFGkbzhGW8LMaoJQzYYkG6z");
Parse.serverURL = 'https://parseapi.back4app.com';
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
async function processPrediction(checkpointName) {
  try {
    const data = await getPrediction(checkpointName);
    
    const pointerToCheckpoint = await getCheckpointPointer(data.checkpoint_name);
    const geoPoint = new Parse.GeoPoint({
      latitude: -1,
      longitude: -1
    });
    const extractedAt = new Date('2024-06-08T12:44:56.080Z');
    const predictionData = {
      checkpoint: pointerToCheckpoint,
      status: data.status,
      type: data.type,
      source: data.sentence,
      third_party: true,
      extractedAt: Date.now().UTC,
      location: geoPoint, 
      approved: 0,
      extractedAt:extractedAt
    };
    
    await addObjectToClass("TestUpdate", predictionData);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the function with the checkpoint name
processPrediction('عناب مغلق');
