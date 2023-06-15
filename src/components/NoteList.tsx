import { useCallback, useEffect, useState } from 'react';
import { Container, Heading } from '../styles/styled';
import { pusherClient } from '../utils/pusher'
import { storeOfflineRequest, getOfflineRequests, deleteOfflineRequest } from '../../public/indexeddb';

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
  const [serverNotes, setServerNotes] = useState<Note[]>([]);
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
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

  const handleEditNote = (noteId: number, updatedTitle: string) => {
    setServerNotes((prevNotes) =>
      prevNotes.map((note) =>
        note._id === noteId ? { ...note, title: updatedTitle } : note
      )
    );
  };

  useEffect(() => {
    fetchNotes();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { type: 'module' })
        .then((registration) => {
          console.log('Service Worker registered:', registration);
  
          // Listen for the "online" event to trigger sync
          window.addEventListener('online', () => {
            registration.sync.register('sync-notes')
              .then(() => {
                console.log('Sync event registered');
              })
              .catch((error) => {
                console.error('Sync event registration failed:', error);
              });
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    const channel = pusherClient?.subscribe('notes');

    if (channel) {
      channel.bind('note-saved', async (data: any) => {
        const savedNote = data; // Assuming the event payload contains the saved note data
        setServerNotes((prevNotes) => {
          const updatedNotes = [savedNote, ...prevNotes];
          return removeDuplicates(updatedNotes);
        });

        // Delete local note if synced from server
        fetchLocalNotes();
      });

      channel.bind('note-deleted', (data: any) => {
        const deletedNoteId = data; // Assuming the event payload contains the ID of the deleted note
        setServerNotes((prevNotes) => prevNotes.filter((note) => note._id !== deletedNoteId));
      });
    }

    return () => {
      pusherClient?.unsubscribe('notes');
    };
  }, [handleNoteSubmit]);

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

  const fetchLocalNotes = async() => {
    let offlineRequests = await getOfflineRequests();
    let newLocalNotes: Note[] = [];
    for (const request of offlineRequests) {
      const offlineNote = request.body;
      if (offlineNote._id !== undefined) {
        newLocalNotes.unshift(offlineNote);
      }
    }
    setLocalNotes(newLocalNotes);
  };

  const fetchNotes = async () => {
    setLoading(true);

    // Simulate a longer loading time (e.g., 2 seconds)
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const response = await axios.get('/api/notes');
      setServerNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  
    fetchLocalNotes();

    /*
    notes.sort(function(x, y) {
      return x.date - y.date;
    })
    */
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
        setLocalNotes((prevNotes) => {
          const updatedNotes = [note, ...prevNotes];
          return updatedNotes;
        });
        console.log('Note stored offline for later sync');
      } catch (error) {
        console.error('Failed to store note offline:', error);
      }
    }
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
              {localNotes.map((note, index) => (
                <NoteItem key={index} note={note} onDeleteNote={handleNoteDelete} onEditNote={handleEditNote} />
              ))}
              {serverNotes.map((note, index) => (
                <NoteItem key={index} note={note} onDeleteNote={handleNoteDelete} onEditNote={handleEditNote} />
              ))}
            </ul>
          )}
        </div>
      </NoteListWrapper>
      <OfflineIndicator />
    </NotesContainer>
  );
}