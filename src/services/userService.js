// ─────────────────────────────────────────────────────────────────────────────
// USER SERVICE  –  maps to UserController.java (/api/user/**)
//
//  GET    /api/user/allUsers          getAllUsers()
//  GET    /api/user/{id}              getUserById(id)
//  POST   /api/user/insertUser        createUser(userDto)   ← admin use
//  PUT    /api/user/update/{id}       updateUser(id, data)  ← profile edit
//  DELETE /api/user/delete/{id}       deleteUser(id)        ← admin use
// ─────────────────────────────────────────────────────────────────────────────

import api from './api';

export const userService = {
  getAllUsers: async () => {
    const res = await api.get('/user/allUsers');
    return res.data; // List<UserDto>
  },

  getUserById: async (userId) => {
    const res = await api.get(`/user/${userId}`);
    return res.data; // UserDto
  },

  // Used by admin to create a user directly (bypasses registerUser role setup)
  createUser: async (userDto) => {
    const res = await api.post('/user/insertUser', userDto);
    return res.data; // UserDto
  },

  // Used by ProfileEditPage – PUT /api/user/update/{id}
  // ⚠️  Note: the old code called /user/updateProfile/{id} which does NOT exist.
  //     The correct endpoint is /user/update/{id}
  updateUser: async (userId, userData) => {
    const res = await api.put(`/user/update/${userId}`, userData);
    return res.data; // UserDto
  },

  deleteUser: async (userId) => {
    const res = await api.delete(`/user/delete/${userId}`);
    return res.data; // ApiResponse
  },
};