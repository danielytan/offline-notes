import { useEffect, useState, ChangeEvent } from 'react';
import { db, Note } from '../api/database';
import { Container, Heading, Button } from '../styles/styled';
import styled from 'styled-components';

const NotesContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const NoteInput = styled.input`
  margin-right: 1rem;
`;

const StyledButton = styled(Button)`
  margin-left: 1rem;
`;

interface NoteItemProps {
  note: Note;
  onDelete: (noteId: number) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onDelete }) => {
  const handleDeleteClick = () => {
    if (note.id !== undefined) {
      onDelete(note.id);
    }
  };

  return (
    <li>
      {note.title}
      <StyledButton onClick={handleDeleteClick}>Delete</StyledButton>
    </li>
  );
};

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
      content: '',
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
    <NotesContainer>
      <Heading>Notes</Heading>
      <InputContainer>
        <NoteInput type="text" value={noteTitle} onChange={handleNoteTitleChange} />
        <StyledButton onClick={handleNoteSubmit}>Add Note</StyledButton>
      </InputContainer>
      <ul>
        {notes.map((note) => (
          <NoteItem key={note.id} note={note} onDelete={handleNoteDelete} />
        ))}
      </ul>
    </NotesContainer>
  );
}