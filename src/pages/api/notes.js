import connectToDatabase from '../../utils/mongo';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Connect to the MongoDB database
      const db = await connectToDatabase();

      // Fetch all the notes from the 'notes' collection
      const collection = db.collection('notes2')
      const notes = (await collection.find({}).toArray()).reverse();

      res.status(200).json(notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}