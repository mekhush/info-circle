// ─────────────────────────────────────────────────────────────────────────────
// COMMENT SERVICE  –  maps to CommentController.java (/api/comment/**)
//
// CommentDto fields: { commentId, content, createdAt }
//
// ⚠️  NOTE: The comment endpoint has NO userId path variable.
//           POST /api/comment/post/{postId}/saveComment
//           Comment is linked to a post only (not to a user) in current backend.
// ─────────────────────────────────────────────────────────────────────────────

import api from './api';

export const commentService = {
  saveComment: async (postId, content) => {
    const res = await api.post(`/comment/post/${postId}/saveComment`, { content });
    return res.data; // CommentDto
  },

  getAllComments: async () => {
    const res = await api.get('/comment/allComments');
    return res.data; // List<CommentDto>
  },

  getCommentById: async (commentId) => {
    const res = await api.get(`/comment/${commentId}`);
    return res.data; // CommentDto
  },

  updateComment: async (commentId, content) => {
    const res = await api.put(`/comment/update/${commentId}`, { content });
    return res.data; // CommentDto
  },

  deleteComment: async (commentId) => {
    const res = await api.delete(`/comment/delete/${commentId}`);
    return res.data; // ApiResponse
  },
};