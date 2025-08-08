import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Styles
import './assets/darkmode.css';
import './assets/teacher-theme.css'; // Styles spécifiques aux enseignants
import './assets/admin-theme.css'; // Styles spécifiques aux administrateurs

// Components and Pages
import Navbar from './components/Navbar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Collections from './pages/Collections';
import CardForm from './pages/CardForm';
import Evaluation from './pages/Stats'; // Stats.js contient le composant Evaluation
import Profile from './pages/Profile';
import ReviewPage from './pages/ReviewPage';
import ReviewCards from './pages/ReviewCards';
import Flashcards from './pages/Flashcards';
import Classes from './pages/Classes';
import StudentClassesDetailPage from './pages/StudentClassesDetailPage';
import AdminDashboard from './pages/AdminDashboard';
// 🗑️ Imports liens partagés supprimés - WebSocket par code remplace tout

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

// A component to protect admin routes
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (user.role !== 'admin') {
    // If not an admin, redirect to home
    return <Navigate to="/home" />;
  }
  return children;
};

function App() {
  const { user, isTeacher } = useAuth();

  return (
    <ThemeProvider>
    <Routes>
      {/* Public routes - redirect if logged in */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <div className={`app-layout ${isTeacher() ? 'teacher-theme' : ''}`}>
            <Navbar />
            <div className="main-content">
              <Navigate to="/home" replace />
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/home" element={
        <ProtectedRoute>
          <div className={`app-layout ${isTeacher() ? 'teacher-theme' : ''}`}>
            <Navbar />
            <div className="main-content">
              <Dashboard />
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/review" element={
        <ProtectedRoute>
          <div className={`app-layout ${isTeacher() ? 'teacher-theme' : ''}`}>
            <Navbar />
            <div className="main-content">
              <ReviewPage />
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/review-cards" element={
        <ProtectedRoute>
          <div className={`app-layout ${isTeacher() ? 'teacher-theme' : ''}`}>
            <Navbar />
            <div className="main-content">
              <ReviewCards />
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/flashcards" element={
        <ProtectedRoute>
          <div className={`app-layout ${isTeacher() ? 'teacher-theme' : ''}`}>
            <Navbar />
            <div className="main-content">
              <Flashcards />
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/collections" element={
        <ProtectedRoute>
          <div className={`app-layout ${isTeacher() ? 'teacher-theme' : ''}`}>
            <Navbar />
            <div className="main-content">
              <Collections />
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/collections/:collectionId" element={
        <ProtectedRoute>
          <div className={`app-layout ${isTeacher() ? 'teacher-theme' : ''}`}>
            <Navbar />
            <div className="main-content">
              <Collections />
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/card/new" element={
        <ProtectedRoute>
          <div className={`app-layout ${isTeacher() ? 'teacher-theme' : ''}`}>
            <Navbar />
            <div className="main-content">
              <CardForm />
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/card/edit/:cardId" element={
        <ProtectedRoute>
          <div className={`app-layout ${isTeacher() ? 'teacher-theme' : ''}`}>
            <Navbar />
            <div className="main-content">
              <CardForm />
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/stats" element={
        <ProtectedRoute>
          <div className={`app-layout ${isTeacher() ? 'teacher-theme' : ''}`}>
            <Navbar />
            <div className="main-content">
              <Evaluation />
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <div className={`app-layout ${isTeacher() ? 'teacher-theme' : ''}`}>
            <Navbar />
            <div className="main-content">
              <Profile />
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/classes" element={
        <ProtectedRoute>
          <div className={`app-layout ${isTeacher() ? 'teacher-theme' : ''}`}>
            <Navbar />
            <div className="main-content">
              <Classes />
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/classes/details" element={
        <ProtectedRoute>
          <div className={`app-layout ${isTeacher() ? 'teacher-theme' : ''}`}>
            <Navbar />
            <div className="main-content">
              <StudentClassesDetailPage />
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      {/* Teacher evaluation route */}
      <Route path="/evaluation" element={
        <ProtectedRoute>
          <div className="app-layout teacher-theme">
            <Navbar />
            <div className="main-content">
              <Evaluation />
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      {/* 🗑️ Routes liens partagés supprimées - WebSocket par code les remplace */}
      
      {/* Admin route */}
      <Route path="/admin" element={
        <AdminRoute>
          <div className={`app-layout admin-theme`}>
            <Navbar />
            <div className="main-content">
              <AdminDashboard />
            </div>
          </div>
        </AdminRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
    </ThemeProvider>
  );
}

export default App;
