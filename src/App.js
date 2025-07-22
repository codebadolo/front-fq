import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DocumentUpload from './pages/DocumentUpload';
import Home from './pages/Home';
import QuizCreate from './pages/QuizCreate';
import QuizDetail from './pages/QuizDetail';
import QuizList from './pages/QuizList';
import QuizUpdate from './pages/QuizUpdate';
const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Home />} />
        <Route path="quizzes" element={<QuizList />} />
        <Route path="quizzes/:id" element={<QuizDetail />} />
        <Route path="/quizzes/:id/edit" element={<QuizUpdate />} />
        <Route path="/quizzes/create" element={<QuizCreate />} />
        <Route path="upload" element={<DocumentUpload />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </Router>
);

export default App;
