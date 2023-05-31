import { useEffect, useState, ChangeEvent } from 'react';
import { Container, Heading, Button } from '../styles/styled';
import { pusherClient } from '../utils/pusher'
import styled from 'styled-components';
import axios from 'axios';

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

  .note-timestamp {
    position: absolute;
    bottom: 0;
    left: 0;
    margin: 0.5rem;
    font-size: 0.8rem;
    color: #888;
  }
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

interface Note {
  _id?: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function NoteList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteTitle, setNoteTitle] = useState('');

  useEffect(() => {
    fetchNotes();
  
    const channel = pusherClient.subscribe('notes');
  
    if (channel) {
      channel.bind('note-saved', (data: any) => {
        // Update the notes state with the received data
        fetchNotes();
      });
    
      channel.bind('note-deleted', (data: any) => {
        // Update the notes state with the received data
        fetchNotes();
      });
    }

    return () => {
      // Unsubscribe from the channel when the component unmounts
      pusherClient.unsubscribe('notes');
    };
  }, []);

  const handleNoteTitleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNoteTitle(event.target.value);
  };

  const handleNoteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission behavior
  
    if (noteTitle.trim() === '') {
      return; // Don't add empty notes
    }
  
    const newNote: Note = {
      title: noteTitle,
      content: '',
      createdAt: new Date().toUTCString(), // Add the current timestamp
    };
  
    try {
      // Send a POST request to the save-note endpoint
      const response = await fetch('/api/save-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });
  
      if (response.ok) {
        const savedNote = await response.json();
        newNote._id = savedNote.insertedId
        setNotes((prevNotes) => [newNote, ...prevNotes]); // Use the functional form of setNotes
        setNoteTitle('');
      } else {
        console.error('Error saving note:', response.status);
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleNoteDelete = async (noteId: number) => {
    try {
      // Make a DELETE request to the API endpoint
      await axios.delete(`/api/delete-note?id=${noteId}`);
  
      // Update the state with the filtered notes
      const updatedNotes = notes.filter((note) => note._id !== noteId);
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await axios.get('/api/notes');
      const allNotes = response.data;
      setNotes(allNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
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
                if (note._id !== undefined) {
                  handleNoteDelete(note._id)
                }
              }}>
                Delete
              </DeleteButton>
              <p className="note-timestamp">
                {note.createdAt}
              </p> {/* Display the timestamp */}
            </NoteItem>
          ))}
        </ul>
      </NoteListWrapper>
    </NotesContainer>
  );
}