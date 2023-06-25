import { useCallback, useEffect, useState } from 'react';
import { Container, Heading } from '../styles/styled';
import { SpinnerContainer } from './LoadingSpinner';
import { pusherClient } from '../utils/pusher'
import { Note, createNote, submitNote, deleteNote, editNote, getNotes } from '../utils/notes'
import { storeOfflineRequest, getOfflineRequests, deleteOfflineRequest } from '../../public/indexeddb';

import styled from 'styled-components';
import axios from 'axios';

import NoteForm from './NoteForm';
import NoteItem from './NoteItem';
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

const NoteListLoadingSpinner = styled(SpinnerContainer)`
  margin-top: 40px;
`;

export default function NoteList() {
  const [serverNotes, setServerNotes] = useState<Note[]>([]);
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const handleNoteSubmit = useCallback(async (noteTitle: string) => {
    const note: Note = createNote(noteTitle);
    await submitNote(note);
    setLocalNotes((prevNotes) => {
      const updatedNotes = [note, ...prevNotes];
      return updatedNotes;
    });
  }, []);

  const handleNoteDelete = useCallback(async (noteId: string) => {
    await deleteNote(noteId);
    fetchLocalNotes();
  }, []);

  const handleEditNote = useCallback(async (noteId: string, updatedTitle: string) => {
    editNote(noteId, updatedTitle);
    setServerNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.localId === noteId) {
          note.title = updatedTitle;
          note.isCached = true;
        }
        return note;
      })
    );
  }, []);

  const fetchNotes = useCallback(async () => {
    setLoading(true);

    // Simulate a longer loading time (e.g., 2 seconds)
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const notes = await getNotes();
      setServerNotes(notes);
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
  }, []);

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

      channel.bind('note-updated', (data: any) => {
        setServerNotes((prevNotes) =>
          prevNotes.map((note) => {
            if (note._id === data._id) {
              note.title = data.title;
            }
            return note;
          })
        );
      });
      
      channel.bind('note-deleted', (data: any) => {
        const deletedNoteId = data; // Assuming the event payload contains the ID of the deleted note
        setServerNotes((prevNotes) => prevNotes.filter((note) => note._id !== deletedNoteId));
      });
    }

    return () => {
      pusherClient?.unsubscribe('notes');
    };
  }, [handleNoteSubmit, fetchNotes]);

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
    let offlineNotes = await getNotes();
    let newLocalNotes: Note[] = [];
    for (const offlineNote of offlineNotes) {
      if (offlineNote.localId !== undefined) {
        newLocalNotes.unshift(offlineNote);
      }
    }
    setLocalNotes(newLocalNotes);
  };

  return (
    <NotesContainer>
      <Heading>Notes</Heading>
      <NoteListWrapper>
        <NoteForm onNoteSubmit={handleNoteSubmit} />
        <div>
          {loading ? (
            <NoteListLoadingSpinner />
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