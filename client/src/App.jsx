import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './components/lobby/HomePage';
import ArenaPage from './components/arena/ArenaPage';
import ResultPage from './components/result/ResultPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/race" element={<ArenaPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </Layout>
  );
}

