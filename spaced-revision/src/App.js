import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Styles
import './assets/darkmode.css';
import './assets/teacher-theme.css'; // Styles spécifiques aux enseignants

// Components and Pages
import Navbar from './components/Navbar';
import DebugRole from './components/DebugRole';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Collections from './pages/Collections';
import CardForm from './pages/CardForm';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
import ReviewPage from './pages/ReviewPage';
import ReviewCards from './pages/ReviewCards';
import Flashcards from './pages/Flashcards';
import Classes from './pages/Classes';
import StudentClassesDetailPage from './pages/StudentClassesDetailPage';

// A layout for protected routes that includes the Navbar
const ProtectedLayout = () => (
  <>
    <Navbar />
    <main className="container mt-4">
      <Outlet />
    </main>
  </>
);

// A component to protect routes
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    // If not logged in, redirect to the login page
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const { user, isTeacher } = useAuth();

  return (
    <ThemeProvider>
    <Routes>
      {/* Public routes - redirect if logged in */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <div className={`app-layout ${isTeacher() ? 'teacher-theme' : ''}`}>
              <Navbar />
              <DebugRole />
              <div className="main-content">
                <Routes>
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  <Route path="/home" element={<Dashboard />} />
                  <Route path="/review" element={<ReviewPage />} />
                  <Route path="/review-cards" element={<ReviewCards />} />
                  <Route path="/flashcards" element={<Flashcards />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/collections/:collectionId" element={<Collections />} />
                  <Route path="/card/new" element={<CardForm />} />
                  <Route path="/card/edit/:cardId" element={<CardForm />} />
                  <Route path="/stats" element={<Stats />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/classes" element={<Classes />} />
                  <Route path="/classes/details" element={<StudentClassesDetailPage />} />
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
    </ThemeProvider>
  );
}

export default App;
