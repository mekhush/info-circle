import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import LandingPage from './pages/user/LandingPage';
import HomePage from './pages/user/HomePage';
import LoginPage from './pages/user/LoginPage';
import SignupPage from './pages/user/SignupPage';
import ProfilePage from './pages/user/ProfilePage';
import ProfileEditPage from './pages/user/ProfileEditPage';
import CreatePostPage from './pages/user/CreatePostPage';
import AdminDashboard from './pages/admin/AdminDashboard';

// ── Protected Route: must be logged in ────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spinner />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ── Admin Route: must be logged in + have ADMIN role ──────────────────────────
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/home" replace />;  // isAdmin is a function!
  return children;
};

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
  </div>
);

function AppContent() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* ── Authenticated ── */}
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
        <Route path="/create-post" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />

        {/* ── Admin ── */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}