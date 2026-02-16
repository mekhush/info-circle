import api from './api';

export const authService = {
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      const { token, user } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid email or password');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};