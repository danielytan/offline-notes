import Dexie from 'dexie';

interface Note {
  id?: number;
  title: string;
  content: string;
}

class NotesDatabase extends Dexie {
  notes: Dexie.Table<Note, number>;

  constructor() {
    super('NotesDatabase');
    this.version(1).stores({
      notes: '++id, title, content',
    });
    this.notes = this.table('notes');
  }
}

export const db = new NotesDatabase();
export type { Note };