import connectToDatabase from '../../api/mongo';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      // Connect to the MongoDB database
      const db = await connectToDatabase();

      // Delete the note from the database
      const collection = db.collection('notes');
      const result = await collection.deleteOne({ "_id": new ObjectId(id) });

      if (result.deletedCount === 1) {
        res.status(200).json({ message: 'Note deleted successfully' });
      } else {
        res.status(404).json({ error: 'Note not found' });
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({ error: 'Failed to delete note' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}