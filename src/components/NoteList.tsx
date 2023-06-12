import { useCallback, useEffect, useState } from 'react';
import { Container, Heading } from '../styles/styled';
import { pusherClient } from '../utils/pusher'
import { storeOfflineRequest, getOfflineRequests } from '../../public/indexeddb';

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
  createdAt: string;
  isCached?: boolean; // Add the isCached property to indicate if the note is locally cached
}

export default function NoteList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const handleNoteSubmit = useCallback(async (noteTitle: string) => {
    const newNote: Note = {
      title: noteTitle,
      createdAt: new Date().toUTCString(), // Add the current timestamp
    };

    // Send a POST request to the save-note endpoint
    sendNoteToServer(newNote);
  }, []);

  const handleNoteDelete = useCallback(async (noteId: number) => {
    try {
      // Make a DELETE request to the API endpoint
      await axios.delete(`/api/delete-note?id=${noteId}`);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }, []);

  const handleSync = useCallback(async () => {
    const notes = await getQueuedNotes();

    for (const note of notes) {
      try {
        await handleNoteSubmit(note);
      } catch (error) {
        console.error('Error syncing note:', error);
        // Handle the error gracefully, such as logging or displaying a notification
      }
    }

    await clearQueuedNotes();
  }, [handleNoteSubmit]);

  useEffect(() => {
    fetchNotes();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { type: 'module' })
        .then((registration) => {
          console.log('Service Worker registered:', registration);
  
          // Listen for the "online" event to trigger sync
          window.addEventListener('online', () => {
            handleSync();
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
      
      navigator.serviceWorker.ready.then((registration) => {
        // Register the 'sync-notes' event
        return registration.sync.register('sync-notes');
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
    }

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
  }, [handleNoteSubmit, handleSync]);

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

    let allNotes = [];
    try {
      const response = await axios.get('/api/notes');
      allNotes = response.data;
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  
    let offlineRequests = await getOfflineRequests();
    for (const request of offlineRequests) {
      const offlineNote = request.body;
      if (!allNotes.some((note: Note) => note._id === offlineNote._id)) {
        allNotes.push(offlineNote);
      }
    }

    /*
    notes.sort(function(x, y) {
      return x.date - y.date;
    })
    */

    setNotes(allNotes);
  };

  async function sendNoteToServer(note: Note) {
    // Check if the browser is online
    if (navigator.onLine) {
      try {
        const response = await fetch('/api/save-note', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(note),
        });
        console.log(response)
        if (response.ok) {
          console.log('Note submitted successfully');
        } else {
          console.error('Failed to submit note');
        }
      } catch (error) {
        console.error('Failed to submit note:', error);
      }
    } else {
      // Browser is offline, store the request in IndexedDB
      try {
        await storeOfflineRequest({
          url: '/api/save-note',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(note),
        });
        note.isCached = true
        setNotes((prevNotes) => {
          const updatedNotes = [note, ...prevNotes];
          return updatedNotes;
        });
        console.log('Note stored offline for later sync');
      } catch (error) {
        console.error('Failed to store note offline:', error);
      }
    }
  }

  async function clearQueuedNotes() {
    localStorage.removeItem('offlineNotes');
  }
  
  async function getQueuedNotes() {
    const notes = JSON.parse(localStorage.getItem('offlineNotes') || '[]');
    return notes;
  }

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