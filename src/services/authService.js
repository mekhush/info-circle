import api from './api';

export const authService = {

  // ── REGISTER ────────────────────────────────────────────────────────────────
  // POST /api/v1/auth/register  →  UserDto (no token)
  // Registration only. NO auto-login.
  signup: async ({ userName, email, password, mobileNumber }) => {
    try {
      const payload = {
        userName,
        email,
        password,
        mobileNumber: Number(mobileNumber),
      };

      const res = await api.post('/v1/auth/register', payload);

      return res.data; // only registered user, no login
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        'Registration failed. Please try again.';
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  },

  // ── LOGIN ────────────────────────────────────────────────────────────────────
  // POST /api/v1/auth/login  →  { token, user: UserDto }
  login: async (email, password) => {
    try {
      const res = await api.post('/v1/auth/login', {
        username: email,   // backend expects "username"
        password,
      });

      const { token, user } = res.data;

      if (!token) throw new Error('No token received from server');
      if (!user)  throw new Error('No user data received from server');

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const msg =
        error.response?.data?.message ||
        error.message ||
        'Invalid username or password';

      throw new Error(msg);
    }
  },

  // ── LOGOUT ───────────────────────────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  getCurrentUser: () => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated: () => Boolean(localStorage.getItem('token')),
};