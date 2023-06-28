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
        await response.json().then(async (data) => {
          note._id = data.insertedId;
          await editOfflineNote(note);
        });
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
        if (localNote.localDeleteSynced === false) {
          const matchingServerNote = serverNotes.find((serverNote: Note) => localNote._id === serverNote._id);
          if (matchingServerNote !== undefined) {
            await deleteOfflineNote(localNote.localId);
            await axios.delete(`/api/delete-note?id=${localNote._id}`);
          }
        } else if (localNote._id === undefined) {
          const submittedNoteResponse = await fetch('/api/save-note', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(createServerNote(localNote)),
          });
          await submittedNoteResponse.json().then(async (data) => {
            localNote._id = data.insertedId;
            await editOfflineNote(localNote);
          });
        }
      }
  
      const updatedLocalNotes = await getOfflineNotes();
      const updatedResponse = await axios.get('/api/notes');
      const updatedServerNotes = updatedResponse.data;

      for (const serverNote of updatedServerNotes) {
        updateSavedNote(serverNote, updatedLocalNotes); // make sure to keep into account locally deleted notes
        updateEditedNote(serverNote, updatedLocalNotes);
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