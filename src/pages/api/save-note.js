import connectToDatabase from '../../utils/mongo';
import { getPusherServer } from '../../utils/pusher';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const noteData = req.body;

      // Connect to the MongoDB database
      const db = await connectToDatabase();

      // Save the note data to the database
      const collection = db.collection('notes2');
      const savedNote = await collection.insertOne(noteData);

      // Trigger the 'note-saved' event on the 'notes' channel
      const pusherServer = getPusherServer();
      await pusherServer.trigger('notes2', 'note-saved', noteData);

      res.status(200).json(savedNote);
    } catch (error) {
      console.error('Error saving note:', error);
      res.status(500).json({ error: 'Failed to save note' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}