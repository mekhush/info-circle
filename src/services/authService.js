import api from './api';

export const authService = {
  signup: async (userData) => {
    const response = await api.post('/user/insertUser', userData);
    return response.data;
  },

  login: async (email, password) => {
    // Simple login - finds user by email/password
    // Note: Your backend doesn't have a login endpoint yet
    const response = await api.get('/user/allUsers');
    const user = response.data.find(
      u => u.email === email && u.password === password
    );
    
    if (user) {
      const token = btoa(`${email}:${password}`); // Simple token
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } else {
      throw new Error('Invalid credentials');
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