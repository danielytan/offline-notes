import { useCallback, useEffect, useState } from 'react';
import { Container, Heading } from '../styles/styled';
import { SpinnerContainer } from './LoadingSpinner';
import { pusherClient } from '../utils/pusher'
import { Note,
  createNote, submitNote, deleteNote, editNote, refreshNotes, getNotes,
  updateSavedNote, updateEditedNote, updateDeletedNote
} from '../utils/notes'

import styled from 'styled-components';

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
  margin-top: 20px;
  margin-bottom: 10px;
`;

export default function NoteList() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const handleNoteSubmit = useCallback(async (noteTitle: string) => {
    const note: Note = createNote(noteTitle);
    await submitNote(note);
    setAllNotes(await getNotes());
  }, []);

  const handleNoteDelete = useCallback(async (noteId: string) => {
    await deleteNote(noteId);
    setAllNotes(await getNotes());
  }, []);

  const handleEditNote = useCallback(async (noteId: string, updatedTitle: string) => {
    await editNote(noteId, updatedTitle);
    setAllNotes(await getNotes());
  }, []);

  const fetchNotes = useCallback(async () => {
    setLoading(true);

    // Simulate a longer loading time (e.g., 2 seconds)
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      await refreshNotes();
      setAllNotes(await getNotes());
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { type: 'module' })
        .then((registration) => {
          console.log('Service Worker registered:', registration);
  
          // Listen for the "online" event to trigger sync
          window.addEventListener('online', async () => {
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

    window.addEventListener('online', async () => {
      await fetchNotes();
    })

    const channel = pusherClient?.subscribe('notes2');

    if (channel) {
      channel.bind('note-saved', async (savedNote: Note) => {
        updateSavedNote(savedNote, await getNotes());
        setAllNotes(await getNotes());
      });

      channel.bind('note-updated', async (updatedNote: Note) => {
        updateEditedNote(updatedNote, await getNotes());
        setAllNotes(await getNotes());
      });
      
      channel.bind('note-deleted', async (deletedNoteId: number) => {
        updateDeletedNote(deletedNoteId, await getNotes());
        setAllNotes(await getNotes());
      });
    }

    return () => {
      pusherClient?.unsubscribe('notes2');
    };
  }, [handleNoteSubmit, fetchNotes]);

  return (
    <NotesContainer>
      <Heading>Notes</Heading>
      <NoteListWrapper>
        <NoteForm onNoteSubmit={handleNoteSubmit} />
        {loading && <NoteListLoadingSpinner />}
        <ul>
          {allNotes.map((note, index) => (
            <NoteItem key={index} note={note} onDeleteNote={handleNoteDelete} onEditNote={handleEditNote} />
          ))}
        </ul>
      </NoteListWrapper>
      <OfflineIndicator />
    </NotesContainer>
  );
}