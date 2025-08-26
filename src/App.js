import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DocumentUpload from './pages/DocumentUpload';
import Home from './pages/Home';
import QuizCreate from './pages/QuizCreate';
import QuizDetail from './pages/QuizDetail';
import QuizList from './pages/QuizList';
import QuizUpdate from './pages/QuizUpdate';
import Login from './components/Login';
import Signup from './components/Signup';
import PrivateRoute from './components/PrivateRoute';
import UsersManagement from './pages/UsersManagement';
import UserCreate from './pages/UserCreate';
import UserDetail from './pages/UserDetail';
import UserEdit from './pages/UserEdit';
import UserProfile from './pages/UserProfile';
const App = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }>
        <Route index element={<Home />} />
        <Route path="quizzes" element={<QuizList />} />
        <Route path="quizzes/:id" element={<QuizDetail />} />
        <Route path="quizzes/:id/edit" element={<QuizUpdate />} />
        <Route path="quizzes/create" element={<QuizCreate />} />
        <Route path="upload" element={<DocumentUpload />} />
        <Route path="/users" element={<UsersManagement />} />
        <Route path="/users/create" element={<UserCreate />} />
<Route path="/users/:id/edit" element={<UserEdit />} />
<Route path="/users/:id" element={<UserDetail />} />
 <Route path="/profile" element={<UserProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </Router>
);

export default App;
