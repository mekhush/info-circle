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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/home" />;
  }
  
  return children;
};

function AppContent() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Profile Routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile/edit" 
          element={
            <ProtectedRoute>
              <ProfileEditPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Placeholder routes for future features */}
        <Route 
          path="/create-post" 
          element={
            <ProtectedRoute>
              <div className="min-h-screen pt-24 px-5">
                <h1 className="text-3xl font-bold text-center">Ask Question</h1>
                <p className="text-center text-gray-600 mt-4">
                  Create post page - coming soon!
                </p>
              </div>
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Route */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <div className="min-h-screen pt-24 px-5">
                <h1 className="text-3xl font-bold text-center">Admin Dashboard</h1>
                <p className="text-center text-gray-600 mt-4">
                  Admin panel - coming soon!
                </p>
              </div>
            </AdminRoute>
          } 
        />

        {/* Catch all - redirect to landing or home based on auth */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;