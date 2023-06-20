import React, { useState, ChangeEvent } from 'react';
import styled from 'styled-components';
import { LoadingSpinner } from './LoadingSpinner'
import { Button } from '../styles/styled';

const NoteFormContainer = styled.form`
  display: flex;
  align-items: stretch;
  align-self: center; /* Center the form horizontally */
`;

const NoteInput = styled.textarea`
  height: 100px;
  width: 100%;
  resize: vertical;
  margin-right: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  flex-grow: 1;
`;

const AddNoteButton = styled(Button)`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
`;

interface NoteFormProps {
  onNoteSubmit: (noteTitle: string) => Promise<void>;
}

const NoteForm: React.FC<NoteFormProps> = ({ onNoteSubmit }) => {
  const [isSyncing, setSyncing] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');

  const handleNoteTitleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNoteTitle(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (noteTitle.trim() === '') {
      return;
    }
    setSyncing(true)
    await onNoteSubmit(noteTitle);
    setSyncing(false)
    setNoteTitle('');
  };

  return (
    <NoteFormContainer onSubmit={handleSubmit}>
      <NoteInput
        rows={3}
        value={noteTitle}
        onChange={handleNoteTitleChange}
        placeholder="Enter your note..."
      />
      <AddNoteButton type="submit">
        {isSyncing ? <LoadingSpinner/> : "Add Note" }
      </AddNoteButton>
    </NoteFormContainer>
  );
};

export default NoteForm;