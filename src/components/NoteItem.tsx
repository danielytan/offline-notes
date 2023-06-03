import React from 'react';
import styled from 'styled-components';
import { Button } from '../styles/styled';

const NoteItemWrapper = styled.li`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 1rem;
  max-height: 150px;
  overflow-y: auto;
  width: 400px;
  word-wrap: break-word;

  .note-timestamp {
    position: absolute;
    bottom: 0;
    left: 0;
    margin: 0.5rem;
    font-size: 0.8rem;
    color: #888;
  }
`;

const Content = styled.div`
  flex-grow: 1;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  overflow-y: auto;
  max-width: 100%;
  padding-bottom: 1rem;
`;

const DeleteButton = styled(Button)`
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 0.5rem;
  z-index: 1;
`;

interface NoteItemProps {
  note: {
    _id?: number;
    title: string;
    createdAt: string;
  };
  onDeleteNote: (noteId: number) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onDeleteNote }) => {
  const handleDelete = () => {
    if (note._id !== undefined) {
      onDeleteNote(note._id);
    }
  };

  return (
    <NoteItemWrapper>
      <Content>{note.title}</Content>
      <DeleteButton onClick={handleDelete}>Delete</DeleteButton>
      <p className="note-timestamp">{note.createdAt}</p>
    </NoteItemWrapper>
  );
};

export default NoteItem;