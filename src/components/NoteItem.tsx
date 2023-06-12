import React from 'react';
import styled from 'styled-components';
import { Button } from '../styles/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const NoteItemWrapper = styled.div`
  margin-bottom: 1rem;
`;

const NoteFrame = styled.li<{ isCached?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 0.25rem;
  max-height: 150px;
  overflow-y: auto;
  width: 500px;
  word-wrap: break-word;
  background-color: ${props => (props.isCached ? '#eee' : 'transparent')};

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
  margin-bottom: 1rem;
  padding-bottom: 0.25rem;
`;

const DeleteButton = styled(Button)`
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 0.5rem;
  z-index: 1;
`;

const OfflineIndicatorWrapper = styled.div`
  display: flex;
  align-items: right;
  justify-content: right;
  position: relative;
  bottom: 0;
  right: 0;
  font-size: 0.75rem; /* Adjust the font size to make the icon smaller */
  color: #fff;
`;

const OfflineIndicatorIcon = styled(FontAwesomeIcon)`
  color: red;
  margin-right: 0.25rem;
`;

const OfflineIndicatorText = styled.span`
  font-size: 0.8rem;
  color: red;
`;

interface NoteItemProps {
  note: {
    _id?: number;
    title: string;
    createdAt: string;
    isCached?: boolean;
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
      <NoteFrame isCached={note.isCached}>
        <Content>{note.title}</Content>
        <DeleteButton onClick={handleDelete}>Delete</DeleteButton>
        <p className="note-timestamp">{note.createdAt}</p>
      </NoteFrame>
      {note.isCached && (
        <OfflineIndicatorWrapper>
          <OfflineIndicatorIcon icon={faExclamationCircle} />
          <OfflineIndicatorText>Note not synced</OfflineIndicatorText>
        </OfflineIndicatorWrapper>
      )}
    </NoteItemWrapper>
  );
};

export default NoteItem;