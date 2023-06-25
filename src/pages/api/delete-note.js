import connectToDatabase from '../../utils/mongo';
import { getPusherServer } from '../../utils/pusher';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      // Connect to the MongoDB database
      const db = await connectToDatabase();

      // Delete the note from the database
      const collection = db.collection('notes2');
      const noteId = new ObjectId(id)
      const result = await collection.deleteOne({ "_id": noteId });

      if (result.deletedCount === 1) {
        // Trigger the 'note-deleted' event on the 'notes' channel
        const pusherServer = getPusherServer();
        await pusherServer.trigger('notes2', 'note-deleted', noteId );

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