import NoteList from '../components/NoteList';
import NoteEditor from '../components/NoteEditor';

const Home = () => {
  return (
    <div>
      <NoteEditor />
      <NoteList />
    </div>
  );
};

export default Home;