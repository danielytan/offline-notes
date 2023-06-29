import connectToDatabase from '../../utils/mongo';
import { getPusherServer } from '../../utils/pusher';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const noteTitle = req.body.title;

      // Connect to the MongoDB database
      const db = await connectToDatabase();

      // Edit the note from the database
      const collection = db.collection('notes2');
      const noteId = new ObjectId(id)

      const result = await collection.updateOne({ "_id": noteId }, {
        $set: {
          title: noteTitle
        }
      });

      if (result.acknowledged === true) {
        // Trigger the 'note-edited' event on the 'notes' channel
        const pusherServer = getPusherServer();
        await pusherServer.trigger('notes2', 'note-updated', { _id: id, title: noteTitle } );

        res.status(200).json({ message: 'Note edited successfully' });
      } else {
        res.status(404).json({ error: 'Note not found' });
      }
    } catch (error) {
      console.error('Error editing note:', error);
      res.status(500).json({ error: 'Failed to edit note' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}