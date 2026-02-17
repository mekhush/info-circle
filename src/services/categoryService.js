// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY SERVICE  –  maps to CategoryController.java (/api/category/**)
//
// CategoryDto fields: { categoryId, categoryTitle, categoryTagLine,
//                       categoryImage, categoryDescription }
// ─────────────────────────────────────────────────────────────────────────────

import api from './api';

export const categoryService = {
  getAllCategories: async () => {
    const res = await api.get('/category/allCategories');
    return res.data; // List<CategoryDto>
  },

  getCategoryById: async (categoryId) => {
    const res = await api.get(`/category/${categoryId}`);
    return res.data; // CategoryDto
  },

  // Admin only
  createCategory: async ({ categoryTitle, categoryTagLine, categoryImage, categoryDescription }) => {
    const res = await api.post('/category/saveCategory', {
      categoryTitle,
      categoryTagLine,
      categoryImage,
      categoryDescription,
    });
    return res.data; // CategoryDto
  },

  updateCategory: async (categoryId, data) => {
    const res = await api.put(`/category/update/${categoryId}`, data);
    return res.data; // CategoryDto
  },

  deleteCategory: async (categoryId) => {
    const res = await api.delete(`/category/delete/${categoryId}`);
    return res.data; // ApiResponse
  },
};