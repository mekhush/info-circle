import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import { categoryService } from '../../services/categoryService';

const CreatePostPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ title: '', content: '', categoryId: '' });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState('');

  // Load categories for dropdown
  useEffect(() => {
    categoryService.getAllCategories()
      .then(setCategories)
      .catch(() => setError('Failed to load categories'))
      .finally(() => setCatLoading(false));
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) { setError('Title is required'); return; }
    if (!formData.content.trim()) { setError('Content is required'); return; }
    if (!formData.categoryId) { setError('Please select a category'); return; }

    setLoading(true);
    try {
      // POST /api/post/user/{userId}/category/{categoryId}/savePost
      const post = await postService.createPost(user.userId, formData.categoryId, {
        title: formData.title,
        content: formData.content,
      });
      navigate(`/post/${post.postId}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-5">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-1 leading-[1.3]">
              Ask a Question
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50/80 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              {catLoading ? (
                <div className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-500">Loading categories…</div>
              ) : (
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                  required
                >
                  <option value="">— Select a category —</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryTitle}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                placeholder="What is your question? Be specific."
                required
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length} characters</p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="8"
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-none"
                placeholder="Describe your question in detail. Include any relevant context, what you've tried, etc."
                required
              />
              <p className="text-xs text-gray-500 mt-1">{formData.content.length} characters</p>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || catLoading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting…' : '🚀 Post Question'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50/80 border border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-800 mb-3">💡 Tips for a great question:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Be specific and clear in your title</li>
            <li>• Include relevant details in the description</li>
            <li>• Mention what you've already tried</li>
            <li>• Choose the most relevant category</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;