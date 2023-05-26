import { useEffect, useState, ChangeEvent } from 'react';
import { db, Note } from '../api/database';

export default function NoteList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteTitle, setNoteTitle] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleNoteTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNoteTitle(event.target.value);
  };

  const handleNoteSubmit = () => {
    if (noteTitle.trim() === '') {
      return; // Don't add empty notes
    }
    
    const newNote: Note = {
      id: Date.now(),
      title: noteTitle,
      content: ''
    };
    
    setNotes([...notes, newNote]);
    setNoteTitle('');
  };

  const handleNoteDelete = (noteId: number) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);
  };

  const fetchNotes = async () => {
    const allNotes = await db.notes.toArray();
    setNotes(allNotes);
  };

  return (
    <div>
      <h1>Notes</h1>
      <input type="text" value={noteTitle} onChange={handleNoteTitleChange} />
      <button onClick={handleNoteSubmit}>Add Note</button>
      <ul>
      {notes.map((note) => (
        <li key={note.id}>
          {note.title}
          <button onClick={() => {
            if (note.id !== undefined) {
              handleNoteDelete(note.id);
            }
          }}>Delete</button>
        </li>
      ))}
      </ul>
    </div>
  );
}