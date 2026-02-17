// ─────────────────────────────────────────────────────────────────────────────
// POST SERVICE  –  maps to PostController.java (/api/post/**)
//
//  POST   /api/post/user/{userId}/category/{categoryId}/savePost
//  GET    /api/post/allPosts?pageNumber=0&pageSize=10&sortBy=postId&sortDir=asc
//  GET    /api/post/{id}
//  PUT    /api/post/update/{id}
//  DELETE /api/post/delete/{id}
//  GET    /api/post/user/{id}/posts
//  GET    /api/post/category/{id}/posts
//  GET    /api/post/search/{key}/posts
//  POST   /api/post/post/image/upload/{postId}          (multipart)
//  GET    /api/post/post/image/{imageName}              (serves image)
//
// PostDto fields: { postId, title, content, postImage, createdAt, updatedAt,
//                   category: CategoryDto, user: UserDto, comments: Set<CommentDto> }
// ─────────────────────────────────────────────────────────────────────────────

import api from './api';

export const postService = {
  // Create a new post
  createPost: async (userId, categoryId, { title, content }) => {
    const res = await api.post(
      `/post/user/${userId}/category/${categoryId}/savePost`,
      { title, content }
    );
    return res.data; // PostDto
  },

  // All posts with pagination
  // Returns: { content: PostDto[], pageNumber, pageSize, totalElements, totalPages, lastPage }
  getAllPosts: async (pageNumber = 0, pageSize = 10, sortBy = 'postId', sortDir = 'asc') => {
    const res = await api.get('/post/allPosts', {
      params: { pageNumber, pageSize, sortBy, sortDir },
    });
    return res.data; // PostResponse
  },

  getPostById: async (postId) => {
    const res = await api.get(`/post/${postId}`);
    return res.data; // PostDto
  },

  updatePost: async (postId, { title, content }) => {
    const res = await api.put(`/post/update/${postId}`, { title, content });
    return res.data; // PostDto
  },

  deletePost: async (postId) => {
    const res = await api.delete(`/post/delete/${postId}`);
    return res.data; // ApiResponse
  },

  getPostsByUser: async (userId) => {
    const res = await api.get(`/post/user/${userId}/posts`);
    return res.data; // List<PostDto>
  },

  getPostsByCategory: async (categoryId) => {
    const res = await api.get(`/post/category/${categoryId}/posts`);
    return res.data; // List<PostDto>
  },

  searchPosts: async (keyword) => {
    const res = await api.get(`/post/search/${encodeURIComponent(keyword)}/posts`);
    return res.data; // List<PostDto>
  },

  // Upload image for a post (multipart/form-data)
  uploadPostImage: async (postId, imageFile) => {
    const form = new FormData();
    form.append('image', imageFile);
    const res = await api.post(`/post/post/image/upload/${postId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data; // PostDto with postImage filename
  },

  // Build the full URL for a post image served by the backend
  getPostImageUrl: (imageName) =>
    `http://localhost:8080/api/post/post/image/${imageName}`,
};