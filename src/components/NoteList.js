import { useEffect, useState } from 'react';
import { getAllNotes } from '../utils/notes';

const NoteList = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    async function fetchNotes() {
      const allNotes = await getAllNotes();
      setNotes(allNotes);
    }
    fetchNotes();
  }, []);

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>{note.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default NoteList;