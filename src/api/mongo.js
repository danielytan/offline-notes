import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = 'offline-notes-db';

let client = null;

async function connectToDatabase() {
  if (client && client.topology && client.topology.isConnected()) {
    console.log('Using existing MongoDB connection');
    return client.db(dbName);
  }

  try {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db(dbName);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Failed to connect to the database');
  }
}

export default connectToDatabase;