// ─────────────────────────────────────────────────────────────────────────────
// WHAT CHANGED IN THE BACKEND (and why this file is rewritten):
//
//  OLD backend                    →  NEW backend
//  POST /api/auth/signup          →  POST /api/v1/auth/register
//  POST /api/auth/login           →  POST /api/v1/auth/login
//  login body: {email, password}  →  login body: {username, password}  ← field renamed!
//  login response: {token, user}  →  login response: {token}           ← no user object!
//  register response: {token,user}→  register response: UserDto        ← no token!
//
//  Because login no longer returns a user object, after login we must:
//    1. Store the token.
//    2. Fetch all users (GET /api/user/allUsers is public) and find the one
//       whose email matches the login email.  This works because SecurityConfig
//       allows all GET requests without authentication.
// ─────────────────────────────────────────────────────────────────────────────

import api from './api';

// Helper: find a user from the full list by email
const fetchUserByEmail = async (email) => {
  const res = await api.get('/user/allUsers');
  const users = res.data;
  return users.find((u) => u.email === email) || null;
};

export const authService = {
  // ── REGISTER ────────────────────────────────────────────────────────────────
  // Endpoint : POST /api/v1/auth/register
  // Sends    : UserDto  (backend requires all @NotEmpty fields)
  // Returns  : UserDto  (no token – must call login separately)
  //
  // ⚠️  BACKEND CONSTRAINT: UserDto marks bio, about, profileImage, address,
  //     city as @NotEmpty. Until you remove those annotations we send a single
  //     placeholder space so validation passes. The user can fill real values
  //     later on the profile-edit page.
  signup: async ({ userName, email, password, mobileNumber }) => {
    try {
      const payload = {
        userName,
        email,
        password,
        mobileNumber: Number(mobileNumber),
        // Placeholder values to satisfy @NotEmpty backend validation.
        // ← Ask your backend dev to make these fields optional (remove @NotEmpty).
        bio: ' ',
        about: ' ',
        profileImage: ' ',
        address: ' ',
        city: ' ',
        pincode: 0,
      };

      // Step 1 – Register (returns UserDto, no token)
      await api.post('/v1/auth/register', payload);

      // Step 2 – Auto-login so the user is immediately authenticated
      const user = await authService.login(email, password);
      return user;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        'Registration failed. Please try again.';
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  },

  // ── LOGIN ────────────────────────────────────────────────────────────────────
  // Endpoint : POST /api/v1/auth/login
  // Sends    : { username: <email>, password }   ← field is "username" not "email"!
  // Returns  : { token }                          ← no user object anymore
  //
  // After getting the token we fetch all users and find the one whose email
  // matches, then store it so the rest of the app works normally.
  login: async (email, password) => {
    try {
      // Backend expects field name "username" even though value is the email
      const tokenRes = await api.post('/v1/auth/login', {
        username: email,
        password,
      });

      const token = tokenRes.data.token;
      if (!token) throw new Error('No token received from server');

      // Store token first so the next request (getAllUsers) is authenticated
      localStorage.setItem('token', token);

      // Fetch user data by searching for matching email
      const user = await fetchUserByEmail(email);
      if (!user) throw new Error('User not found after login');

      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      // Clear anything partial
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