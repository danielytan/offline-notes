import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import SyncIndicator from './SyncIndicator'
import { Note } from '../utils/notes'
import { Button } from '../styles/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const NoteItemWrapper = styled.div`
  margin-bottom: 1rem;
`;

const NoteFrame = styled.li<{ isSubmitted?: boolean }>`
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
  overflow: visible;
  background-color: ${props => (!props.isSubmitted ? '#eee' : 'transparent')};

  .note-timestamp {
    position: absolute;
    bottom: 0;
    left: 0;
    margin: 0.5rem;
    font-size: 0.8rem;
    color: #888;
  }

  .edit-buttons {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    display: flex;
    gap: 0.5rem;
  }

  .note-content {
    width: 95%;
    flex-grow: 1;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    overflow-y: auto;
    max-width: 100%;
    margin-bottom: 0.75rem;
  }

  textarea {
    width: 100%;
    border: none;
    resize: none;
    overflow: hidden;
    font-size: 1rem;
    line-height: 1;
    padding: 0;
    margin: 0;
    height: auto;
    min-height: 0rem;
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

const SaveButton = styled(Button)`
  padding: 5px 10px;
  font-size: 0.8rem;
`;

const CancelButton = styled(Button)`
  padding: 5px 10px;
  font-size: 0.8rem;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: rgba(0, 0, 0, 0.4);
  font-size: 1rem;
  cursor: pointer;
`;

const EditButton = styled(Button)`
  position: absolute;
  padding: 5px 10px;
  bottom: 0.5rem;
  right: 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
`;

const OfflineIndicatorWrapper = styled.div`
  display: flex;
  flex-direction: column; /* Update to column */
  align-items: flex-end; /* Align text elements to the right */
  justify-content: flex-end; /* Align text elements to the bottom */
  position: relative;
  bottom: 0;
  right: 0;
  font-size: 0.75rem; /* Adjust the font size to make the icon smaller */
  color: #fff;
`;

const OfflineIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 0.25rem; /* Add margin-bottom for spacing between pairs */
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
  note: Note,
  onDeleteNote: (noteId: string) => Promise<void>;
  onEditNote: (noteId: string, updatedTitle: string) => Promise<void>;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onDeleteNote, onEditNote }) => {
  const [isSyncing, setSyncing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDelete = async () => {
    // Set syncing state to true before making the request
    setSyncing(true);

    try {
      // Make the delete request to the server
      if (note.localId !== undefined) {
        await onDeleteNote(note.localId);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      // Set syncing state back to false after the request is complete
      setSyncing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTitle(note.title);
  };

  const handleSave = async () => {
    if (note.localId !== undefined) {
      setSyncing(true);
      await onEditNote(note.localId, title);
      setSyncing(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTitle(note.title);
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.value = note.title;
    }
  }, [isEditing, title]);

  return (
    <NoteItemWrapper>
      <NoteFrame isSubmitted={note._id !== undefined}>
        {isSyncing && <SyncIndicator/>}
        <DeleteButton onClick={handleDelete}>[x]</DeleteButton>
        <p className="note-timestamp">{new Date(note.createdAt).toUTCString()}</p>
        <div className="note-content">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          ) : (
            <Content>{note.title}</Content>
          )}
        </div>
        {isEditing ? (
          <div className="edit-buttons">
            <SaveButton onClick={handleSave}>Save</SaveButton>
            <CancelButton onClick={handleCancel}>Cancel</CancelButton>
          </div>
        ) : (
          <EditButton onClick={handleEdit}>Edit</EditButton>
        )}
      </NoteFrame>
      {(note.localDeleteSynced === false || note.localEditSynced === false || note._id === undefined) && (
        <OfflineIndicatorWrapper>
          {note.localDeleteSynced === false && (
            <OfflineIndicator>
              <OfflineIndicatorIcon icon={faExclamationCircle} />
              <OfflineIndicatorText>Note deletion not synced</OfflineIndicatorText>
            </OfflineIndicator>
          )}
          {note.localEditSynced === false && (
            <OfflineIndicator>
              <OfflineIndicatorIcon icon={faExclamationCircle} />
              <OfflineIndicatorText>Note edit not synced</OfflineIndicatorText>
            </OfflineIndicator>
          )}
          {note._id === undefined && (
            <OfflineIndicator>
              <OfflineIndicatorIcon icon={faExclamationCircle} />
              <OfflineIndicatorText>Note submission not synced</OfflineIndicatorText>
            </OfflineIndicator>
          )}
        </OfflineIndicatorWrapper>
      )}
    </NoteItemWrapper>
  );
};

export default NoteItem;