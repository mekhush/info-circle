
// App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import LandingPage from './pages/user/LandingPage';
import HomePage from './pages/user/HomePage';
import LoginPage from './pages/user/LoginPage';
import SignupPage from './pages/user/SignupPage';
import ForgotPassPage from './pages/user/ForgotPassPage';
import ResetPasswordPage from './pages/user/ResetPasswordPage';
import ProfilePage from './pages/user/ProfilePage';
import ProfileEditPage from './pages/user/ProfileEditPage';
import CreatePostPage from './pages/user/CreatePostPage';
import MyPostsPage from './pages/user/MyPostsPage';
import SettingsPage from './pages/user/SettingsPage';
import AllPostsPage from './pages/user/AllPostsPage';
import AdminDashboard from './pages/admin/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spinner />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Redirects logged-in users away from public-only pages (landing, login, signup)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spinner />;
  return isAuthenticated ? <Navigate to="/home" replace /> : children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/home" replace />;
  return children;
};

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
  </div>
);

function AdminThemeSync() {
  const { isAdmin } = useAuth();
  const { setAdminTheme } = useTheme();

  useEffect(() => {
    setAdminTheme(isAdmin());
  }, [isAdmin, setAdminTheme]);

  return null;
}

function AppContent() {
  return (
    <Router>
      <AdminThemeSync />
      <Navbar />
      <Routes>
        <Route path="/"            element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
        <Route path="/login"       element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/forgot-password"   element={<ForgotPassPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/signup"      element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
        <Route path="/home"        element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
        <Route path="/create-post" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
        <Route path="/my-posts"    element={<ProtectedRoute><MyPostsPage /></ProtectedRoute>} />
        <Route path="/settings"    element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/all-posts"   element={<ProtectedRoute><AllPostsPage /></ProtectedRoute>} />
        <Route path="/admin"       element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}











// // App.jsx
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import { ThemeProvider } from './context/ThemeContext';
// import Navbar from './components/common/Navbar';
// import LandingPage from './pages/user/LandingPage';
// import HomePage from './pages/user/HomePage';
// import LoginPage from './pages/user/LoginPage';
// import SignupPage from './pages/user/SignupPage';
// import ProfilePage from './pages/user/ProfilePage';
// import ProfileEditPage from './pages/user/ProfileEditPage';
// import CreatePostPage from './pages/user/CreatePostPage';
// import MyPostsPage from './pages/user/MyPostsPage';
// import SettingsPage from './pages/user/SettingsPage';
// import AllPostsPage from './pages/user/AllPostsPage';
// import AdminDashboard from './pages/admin/AdminDashboard';

// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, loading } = useAuth();
//   if (loading) return <Spinner />;
//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// };

// // Redirects logged-in users away from public-only pages (landing, login, signup)
// const PublicOnlyRoute = ({ children }) => {
//   const { isAuthenticated, loading } = useAuth();
//   if (loading) return <Spinner />;
//   return isAuthenticated ? <Navigate to="/home" replace /> : children;
// };

// const AdminRoute = ({ children }) => {
//   const { isAuthenticated, isAdmin, loading } = useAuth();
//   if (loading) return <Spinner />;
//   if (!isAuthenticated) return <Navigate to="/login" replace />;
//   if (!isAdmin()) return <Navigate to="/home" replace />;
//   return children;
// };

// const Spinner = () => (
//   <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
//     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
//   </div>
// );

// function AppContent() {
//   return (
//     <Router>
//       <Navbar />
//       <Routes>
//         <Route path="/"            element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
//         <Route path="/login"       element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
//         <Route path="/signup"      element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
//         <Route path="/home"        element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
//         <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
//         <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
//         <Route path="/create-post" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
//         <Route path="/my-posts"    element={<ProtectedRoute><MyPostsPage /></ProtectedRoute>} />
//         <Route path="/settings"    element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
//         <Route path="/all-posts"   element={<ProtectedRoute><AllPostsPage /></ProtectedRoute>} />
//         <Route path="/admin"       element={<AdminRoute><AdminDashboard /></AdminRoute>} />
//         <Route path="*"            element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// }

// export default function App() {
//   return (
//     <ThemeProvider>
//       <AuthProvider>
//         <AppContent />
//       </AuthProvider>
//     </ThemeProvider>
//   );
// }