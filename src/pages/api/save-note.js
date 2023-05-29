import connectToDatabase from '../../api/mongo';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const noteData = req.body;

      // Connect to the MongoDB database
      const db = await connectToDatabase();

      // Save the note data to the database
      const collection = db.collection('notes');
      const savedNote = await collection.insertOne(noteData);

      res.status(200).json(savedNote);
    } catch (error) {
      console.error('Error saving note:', error);
      res.status(500).json({ error: 'Failed to save note' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}