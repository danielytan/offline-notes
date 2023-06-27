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

  title: string;
  createdAt: Date;
}

function createServerNote(note: Note) {
  const serverNote: Note = {
    title: note.title,
    localId: note.localId,
    createdAt: note.createdAt
  }
  return serverNote
}

export function createNote(noteTitle: string) {
  const note: Note = {
    title: noteTitle,
    localId: crypto.randomUUID(),
    createdAt: new Date() // Add the current timestamp
  };
  return note;
}

export async function submitNote(note: Note) {
  // Store the note in IndexedDB first
  note.localSubmitSynced = false;
  await storeOfflineNote(note);

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
      if (note._id === undefined) {
        await deleteOfflineNote(noteId);
      } else {
        // Check if the browser is online
        if (navigator.onLine) {
          // Make a DELETE request to the API endpoint
          try {
            await deleteOfflineNote(noteId);
            await axios.delete(`/api/delete-note?id=${note._id}`);
          } catch (error) {
            console.error('Error deleting note:', error);
          }
        } else {
          note.localDeleteSynced = false;
          await editOfflineNote(note);
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
      note.localEditSynced = false;
      if (note._id === undefined) {
        note.title = updatedTitle;
        await editOfflineNote(note);
      } else {
        // Check if the browser is online
        if (navigator.onLine) {
          // Make a PUT request to the API endpoint
          try {
            note.title = updatedTitle;
            note.localEditSynced = undefined;
            await editOfflineNote(note);
            await axios.put(`/api/edit-note?id=${note._id}`, { title: updatedTitle });
          } catch (error) {
            console.error('Error editing note:', error);
          }
        } else {
          note.title = updatedTitle;
          note.localEditSynced = false;
          await editOfflineNote(note);
        }
      }
    }
  } catch (error) {
    console.error('Failed to edit note:', error);
  }
}

export async function updateSavedNote(serverNote: Note, localNotes: Note[]) {
  const matchingSyncedLocalNote = localNotes.find(
    (localNote: Note) => localNote._id === serverNote._id
  );
  if (matchingSyncedLocalNote === undefined) {
    const matchingUnsyncedLocalNote = localNotes.find(
      (localNote: Note) => localNote.localId === serverNote.localId
    );
    if (matchingUnsyncedLocalNote !== undefined) {
      matchingUnsyncedLocalNote._id = serverNote._id;
      matchingUnsyncedLocalNote.localSubmitSynced = undefined;
      await editOfflineNote(matchingUnsyncedLocalNote);
    } else {
      serverNote.localId = crypto.randomUUID();
      await storeOfflineNote(serverNote);
    }
  }
}

export async function updateEditedNote(serverNote: Note, localNotes: Note[]) {
  const matchingLocalNote = localNotes.find((localNote: Note) => localNote._id === serverNote._id);
  if (matchingLocalNote !== undefined) {
    if (matchingLocalNote.localEditSynced === false) {
      await axios.put(`/api/edit-note?id=${matchingLocalNote._id}`, { title: matchingLocalNote.title });
      matchingLocalNote.localEditSynced = undefined;
      await editOfflineNote(matchingLocalNote);
    } else if (matchingLocalNote.localEditSynced === undefined) {
      matchingLocalNote.title = serverNote.title;
      await editOfflineNote(matchingLocalNote);
    }
  }
}

export async function updateDeletedNote(serverId: number, localNotes: Note[]) {
  const matchingLocalNote = localNotes.find((localNote: Note) => localNote._id === serverId);
  if (matchingLocalNote !== undefined) {
    await deleteOfflineNote(matchingLocalNote.localId);
  }
}

export async function refreshNotes() {
  if (navigator.onLine) {
    try {
      const localNotes = await getOfflineNotes();
      const response = await axios.get('/api/notes');
      const serverNotes = response.data;

      for (const localNote of localNotes) {
        if (localNote.localSubmitSynced === false) {
          await fetch('/api/save-note', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(createServerNote(localNote)),
          });
          localNote.localSubmitSynced = undefined;
          await editOfflineNote(localNote);
        } else if (localNote.localDeleteSynced === false) {
          const matchingServerNote = serverNotes.find((serverNote: Note) => localNote._id === serverNote._id);
          if (matchingServerNote !== undefined) {
            await axios.delete(`/api/delete-note?id=${localNote._id}`);
          }
          await deleteOfflineNote(localNote.localId);
        } else if (localNote.localSubmitSynced === undefined) {
          await deleteOfflineNote(localNote.localId);
        }
      }
  
      for (const serverNote of serverNotes) {
        updateSavedNote(serverNote, localNotes);
        updateEditedNote(serverNote, localNotes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }
}

export async function getNotes() {
  const notes = await getOfflineNotes();
  notes.sort(function(a: Note, b: Note) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return notes;
}