import { useEffect, useState, ChangeEvent } from 'react';
import { db, Note } from '../api/database';
import { Container, Heading, Button } from '../styles/styled';
import styled from 'styled-components';

const NotesContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NoteListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%; /* Adjust the width to a percentage value */
  margin: auto; /* Add margin: auto to center the wrapper */
`;


const NoteForm = styled.form`
  display: flex;
  align-items: stretch;
  align-self: center; /* Center the form horizontally */
`;

const NoteInput = styled.textarea`
  height: 100px;
  width: 100%;
  resize: vertical;
  margin-right: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  flex-grow: 1;
`;

const AddNoteButton = styled(Button)`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
`;

const NoteItem = styled.li`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 1rem;
  max-height: 150px;
  overflow-y: auto;
  width: 400px;
  word-wrap: break-word;
`;

const Content = styled.div`
  flex-grow: 1;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  overflow-y: auto;
  max-width: 100%;
  padding-bottom: 1rem; /* Add padding to shift the text above the delete button */
`;

const DeleteButton = styled(Button)`
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 0.5rem;
  z-index: 1;
`;

export default function NoteList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteTitle, setNoteTitle] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleNoteTitleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNoteTitle(event.target.value);
  };

  const handleNoteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission behavior
  
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
    <NotesContainer>
      <Heading>Notes</Heading>
      <NoteListWrapper>
        <NoteForm onSubmit={handleNoteSubmit}>
          <NoteInput
            rows={3}
            value={noteTitle}
            onChange={handleNoteTitleChange}
            placeholder="Enter your note..."
          />
          <AddNoteButton type="submit">Add Note</AddNoteButton>
        </NoteForm>
        <ul>
          {notes.map((note, index) => (
            <NoteItem key={index}>
              <Content>{note.title}</Content>
              <DeleteButton onClick={() => {
                if (note.id !== undefined) {
                  handleNoteDelete(note.id)
                }
              }}>
                Delete
              </DeleteButton>
            </NoteItem>
          ))}
        </ul>
      </NoteListWrapper>
    </NotesContainer>
  );
}