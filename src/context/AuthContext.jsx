import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage on page refresh
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // ── LOGIN ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const userData = await authService.login(email, password);
    setUser(userData);
    return userData;
  };

  // ── SIGNUP ───────────────────────────────────────────────────────────────
  // IMPORTANT:
  // Signup should ONLY register the user.
  // It should NOT auto-login.
  // After signup, user will be redirected to login page.
  const signup = async (formData) => {
    await authService.signup(formData);
    return true; // no auto login, no user set
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Called after profile edit to keep context + localStorage in sync
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // ── isAdmin check ────────────────────────────────────────────────────────
  // The backend assigns roles via the Role entity.
  // AppConstant.ADMIN_USER = 501  →  roleName stored as "ADMIN"
  // AppConstant.NORMAL_USER = 502 →  roleName stored as "USER"
  //
  // UserDto exposes:  roles: Set<RoleDto>  where RoleDto = { roleId, roleName }
  // So we check the roles array that comes back in the user object.
  const isAdmin = () => {
    if (!user) return false;

    // Check roles array (preferred — backend driven)
    if (Array.isArray(user.roles) && user.roles.some((r) => r.roleName === 'ADMIN')) {
      return true;
    }

    // Fallback: email pattern (development convenience)
    if (user.email?.toLowerCase().includes('admin')) return true;

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin,   // ← always a FUNCTION; call it as isAdmin() in components
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};