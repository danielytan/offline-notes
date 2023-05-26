import NoteList from '../components/NoteList';
import styled from 'styled-components';

const PageContainer = styled.div`
  text-align: center;
`;

const Heading = styled.h1`
  margin-top: 2rem;
`;

export default function Notes() {
  return (
    <PageContainer>
      <Heading>Offline Notes</Heading>
      <NoteList />
    </PageContainer>
  );
}