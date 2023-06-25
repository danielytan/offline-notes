import axios from 'axios';
import {
  storeOfflineNote,
  getOfflineNote,
  getOfflineNotes,
  deleteOfflineNote,
  editOfflineNote
} from '../../public/indexeddb';

export interface Note {
  _id?: number; // Used by MongoDB
  localId?: string;

  localDeleteSynced?: boolean;
  localEditSynced?: boolean;
  localSubmitSynced?: boolean;

  isCached?: boolean;

  title: string;
  createdAt: string;
}

function createServerNote(note: Note) {
  const serverNote: Note = {
    title: note.title,
    createdAt: note.createdAt
  }
  return serverNote
}

export function createNote(noteTitle: string) {
  const note: Note = {
    title: noteTitle,
    localId: crypto.randomUUID(),
    localSubmitSynced: false,
    createdAt: new Date().toUTCString() // Add the current timestamp
  };
  return note;
}

export async function submitNote(note: Note) {
  // Store the note in IndexedDB first
  try {
    await storeOfflineNote(note);
    console.log('Local note stored');
  } catch (error) {
    console.error('Failed to store local note:', error);
  }

  // Check if the browser is online
  if (navigator.onLine) {
    // Send a POST request to the save-note endpoint
    try {
      const response = await fetch('/api/save-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createServerNote(note)),
      });

      if (response.ok) {
        note.localSubmitSynced = undefined;
        console.log('Note submitted successfully');
      } else {
        console.error('Failed to submit note');
      }
    } catch (error) {
      console.error('Failed to submit note:', error);
    }
  }
}

export async function deleteNote(noteId: string) {
  try {
    const note = await getOfflineNote(noteId);
    if (note !== undefined) {
      if (note._id !== undefined) {
        await deleteOfflineNote(noteId);
      } else {
        // Check if the browser is online
        if (navigator.onLine) {
          // Make a DELETE request to the API endpoint
          try {
            await axios.delete(`/api/delete-note?id=${noteId}`);
            await deleteOfflineNote(noteId);
          } catch (error) {
            console.error('Error deleting note:', error);
          }
        } else {
          note.localDeleteSynced = false;
        }
      }
    }
  } catch (error) {
    console.error('Failed to delete note:', error);
  }
}

export async function editNote(noteId: string, updatedTitle: string) {
  try {
    const note = await getOfflineNote(noteId);
    if (note !== undefined) {
      if (note._id !== undefined) {
        await editOfflineNote(noteId, updatedTitle);
      } else {
        // Check if the browser is online
        if (navigator.onLine) {
          // Make a PUT request to the API endpoint
          try {
            await axios.put(`/api/edit-note?id=${noteId}`, { title: updatedTitle });
            await editOfflineNote(noteId, updatedTitle);
          } catch (error) {
            console.error('Error editing note:', error);
          }
        } else {
          await editOfflineNote(noteId, updatedTitle);
          note.localEditSynced = false;
        }
      }
    }
  } catch (error) {
    console.error('Failed to edit note:', error);
  }
}

export async function getNotes() {
  let fetchedNotes: Note[] = [];

  let localNotes = await getOfflineNotes();
  for (const localNote of localNotes) {
    fetchedNotes.unshift(localNote);
  }

  if (navigator.onLine) {
    try {
      for (const localNote of localNotes) {
        localNote.localSubmitSynced = undefined;
        await fetch('/api/save-note', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(localNote),
        });
      }
    
      const response = await axios.get('/api/notes');
      const serverNotes = response.data;

      for (const serverNote of serverNotes) {
        const matchingLocalNote = localNotes.find((localNote: Note) => localNote._id === serverNote._id);
        if (matchingLocalNote !== undefined) {
          if (matchingLocalNote.localDeletedSynced === false) {
            await axios.delete(`/api/delete-note?id=${matchingLocalNote._id}`);
            await deleteOfflineNote(matchingLocalNote.localId);
          } else if (matchingLocalNote.localEditSynced === false) {
            await axios.put(`/api/edit-note?id=${matchingLocalNote._id}`, { title: matchingLocalNote.title });
            matchingLocalNote.localSubmitSynced = undefined;
          }
        } else {
          serverNote.localId = crypto.randomUUID();
          fetchedNotes.push(serverNote);
        }
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  } else {
  }

  return fetchedNotes;
}