import { useState } from 'react';
import { createNote } from '../utils/notes';

const NoteEditor = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createNote({
      title,
      content,
    });
    setTitle('');
    setContent('');
  };

  return (
    <div>
      <h1>Create Note</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" value={title} onChange={handleTitleChange} placeholder="Title" required />
        <textarea value={content} onChange={handleContentChange} placeholder="Content" required />
        <button type="submit">Save Note</button>
      </form>
    </div>
  );
};

export default NoteEditor;