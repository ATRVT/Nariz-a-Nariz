import { Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import NewTraining from './pages/NewTraining';
import Dogs from './pages/Dogs';
import Trainers from './pages/Trainers';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="new" element={<NewTraining />} />
        <Route path="dogs" element={<Dogs />} />
        <Route path="trainers" element={<Trainers />} />
      </Route>
    </Routes>
  );
}

export default App;
