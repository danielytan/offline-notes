import Dexie from 'dexie';

// Define the database using Dexie
const db = new Dexie('myDatabase');
db.version(1).stores({
  notes: '++id, title, content', // Define the object store and its indexes
});

// Function to add a note to the database
async function addNoteToDatabase(title, content) {
  try {
    const note = { title, content };
    await db.notes.add(note);
    console.log('Note added successfully.');
  } catch (error) {
    console.error('Error adding note:', error);
  }
}

// Function to retrieve all notes from the database
async function getAllNotesFromDatabase() {
  try {
    const notes = await db.notes.toArray();
    console.log('All notes:', notes);
  } catch (error) {
    console.error('Error retrieving notes:', error);
  }
}

export { addNoteToDatabase, getAllNotesFromDatabase };