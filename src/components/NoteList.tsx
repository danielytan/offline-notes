import { useEffect, useState } from 'react';
import { Container, Heading } from '../styles/styled';
import { pusherClient } from '../utils/pusher'
import styled from 'styled-components';
import axios from 'axios';

import NoteForm from './NoteForm';
import NoteItem from './NoteItem';
import LoadingSpinner from './LoadingSpinner';
import OfflineIndicator from './OfflineIndicator';

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

interface Note {
  _id?: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function NoteList() {
  const [notes, setNotes] = useState<Note[]>([]);
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
  
      // Convert headers object to an array of key-value pairs
      const headersArray = Object.entries(response.headers);
  
      // Cache the response
      caches.open('api-cache').then((cache) => {
        const clonedResponse = new Response(JSON.stringify(response.data), {
          status: response.status,
          statusText: response.statusText,
          headers: headersArray
        });
        cache.put('/api/notes', clonedResponse);
      });
  
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteSubmit = async (noteTitle: string) => {    
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
        <NoteForm onNoteSubmit={handleNoteSubmit} />
        <div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <ul>
              {notes.map((note, index) => (
                <NoteItem key={index} note={note} onDeleteNote={handleNoteDelete} />
              ))}
            </ul>
          )}
        </div>
      </NoteListWrapper>
      <OfflineIndicator />
    </NotesContainer>
  );
}