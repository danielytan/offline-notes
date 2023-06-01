import { useEffect, useState, ChangeEvent } from 'react';
import { Container, Heading, Button } from '../styles/styled';
import { pusherClient } from '../utils/pusher'
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

const spinAnimation = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 2px solid #ccc;
  border-top-color: #555;
  border-radius: 50%;
  margin-top: 40px; /* Add some margin-top to move the spinner lower */
  animation: ${spinAnimation} 1s linear infinite;
`;

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotes();

    const channel = pusherClient?.subscribe('notes');

    if (channel) {
      channel.bind('note-saved', (data: any) => {
        const savedNote = data; // Assuming the event payload contains the saved note data
        setNotes((prevNotes) => {
          const updatedNotes = [savedNote, ...prevNotes];
          return removeDuplicates(updatedNotes);
        });
      });

      channel.bind('note-deleted', (data: any) => {
        const deletedNoteId = data; // Assuming the event payload contains the ID of the deleted note
        setNotes((prevNotes) => prevNotes.filter((note) => note._id !== deletedNoteId));
      });
    }

    return () => {
      pusherClient?.unsubscribe('notes');
    };
  }, []);

  const removeDuplicates = (notes: Note[]) => {
    const uniqueNotes = notes.reduce((uniqueList: Note[], note: Note) => {
      if (!uniqueList.some((uniqueNote) => uniqueNote._id === note._id)) {
        uniqueList.push(note);
      } else {
        console.log('Duplicate note found:', note);
      }
      return uniqueList;
    }, []);
    return uniqueNotes;
  };

  const fetchNotes = async () => {
    setLoading(true);

    // Simulate a longer loading time (e.g., 2 seconds)
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const response = await axios.get('/api/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      console.error('Error deleting note:', error);
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
        <div>
          {loading ? (
            <LoadingSpinner />
          ) : (
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
          )}
        </div>
      </NoteListWrapper>
    </NotesContainer>
  );
}