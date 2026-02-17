import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { postService } from '../../services/postService';
import { categoryService } from '../../services/categoryService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New category form
  const [newCat, setNewCat] = useState({
    categoryTitle: '', categoryTagLine: '', categoryDescription: '', categoryImage: '',
  });
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [u, p, c] = await Promise.all([
        userService.getAllUsers(),
        postService.getAllPosts(0, 20),
        categoryService.getAllCategories(),
      ]);
      setUsers(u);
      setPosts(p.content || []);
      setCategories(c);
    } catch {
      setError('Failed to load data. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return;
    try {
      await userService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
      setSuccess('User deleted');
    } catch { setError('Failed to delete user'); }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await postService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.postId !== postId));
      setSuccess('Post deleted');
    } catch { setError('Failed to delete post'); }
  };

  const handleDeleteCategory = async (catId) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categoryService.deleteCategory(catId);
      setCategories((prev) => prev.filter((c) => c.categoryId !== catId));
      setSuccess('Category deleted');
    } catch { setError('Failed to delete category'); }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCatLoading(true);
    try {
      const created = await categoryService.createCategory(newCat);
      setCategories((prev) => [...prev, created]);
      setNewCat({ categoryTitle: '', categoryTagLine: '', categoryDescription: '', categoryImage: '' });
      setSuccess('Category created!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setCatLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'users', label: '👥 Users' },
    { id: 'posts', label: '📝 Posts' },
    { id: 'categories', label: '🏷️ Categories' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-5">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            👑 Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage users, posts, and categories</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex justify-between">
            {error}
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm flex justify-between">
            {success}
            <button onClick={() => setSuccess('')}>✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                activeTab === t.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
          </div>
        ) : (
          <>
            {/* ── Overview Tab ─────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Users', value: users.length, emoji: '👥', color: 'from-blue-500 to-blue-600' },
                  { label: 'Total Posts', value: posts.length, emoji: '📝', color: 'from-purple-500 to-purple-600' },
                  { label: 'Categories', value: categories.length, emoji: '🏷️', color: 'from-pink-500 to-pink-600' },
                ].map((stat) => (
                  <div key={stat.label} className={`p-8 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-xl`}>
                    <div className="text-5xl mb-4">{stat.emoji}</div>
                    <h3 className="text-4xl font-bold mb-1">{stat.value}</h3>
                    <p className="text-white/80">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Users Tab ─────────────────────────────────────────────────── */}
            {activeTab === 'users' && (
              <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/60">
                  <h2 className="text-2xl font-bold text-gray-800">All Users ({users.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/40">
                      <tr>
                        {['ID', 'Name', 'Email', 'Mobile', 'Roles', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/40">
                      {users.map((u) => (
                        <tr key={u.userId} className="hover:bg-white/30 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-600">#{u.userId}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{u.userName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{u.mobileNumber}</td>
                          <td className="px-4 py-3">
                            {(u.roles || []).map((r) => (
                              <span key={r.roleId} className={`px-2 py-1 rounded-full text-xs font-semibold mr-1 ${r.roleName === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {r.roleName}
                              </span>
                            ))}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDeleteUser(u.userId)}
                              className="px-3 py-1 text-xs text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Posts Tab ─────────────────────────────────────────────────── */}
            {activeTab === 'posts' && (
              <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/60">
                  <h2 className="text-2xl font-bold text-gray-800">All Posts ({posts.length})</h2>
                </div>
                <div className="divide-y divide-white/40">
                  {posts.map((p) => (
                    <div key={p.postId} className="flex items-center justify-between px-6 py-4 hover:bg-white/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate">{p.title}</h4>
                        <p className="text-sm text-gray-500">
                          By {p.user?.userName} · {p.category?.categoryTitle} · {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4 shrink-0">
                        <button
                          onClick={() => navigate(`/post/${p.postId}`)}
                          className="px-3 py-1 text-xs text-purple-600 border border-purple-200 rounded-full hover:bg-purple-50 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeletePost(p.postId)}
                          className="px-3 py-1 text-xs text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Categories Tab ────────────────────────────────────────────── */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                {/* Create category form */}
                <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">➕ Add New Category</h2>
                  <form onSubmit={handleCreateCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'categoryTitle', placeholder: 'Category title (min 4 chars)', label: 'Title *' },
                      { name: 'categoryTagLine', placeholder: 'Short tagline (min 10 chars)', label: 'Tagline *' },
                      { name: 'categoryImage', placeholder: 'Image URL (optional)', label: 'Image URL' },
                    ].map((f) => (
                      <div key={f.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                        <input
                          type="text"
                          name={f.name}
                          value={newCat[f.name]}
                          onChange={(e) => setNewCat({ ...newCat, [e.target.name]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                          required={f.label.includes('*')}
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <textarea
                        name="categoryDescription"
                        value={newCat.categoryDescription}
                        onChange={(e) => setNewCat({ ...newCat, categoryDescription: e.target.value })}
                        placeholder="Category description"
                        rows="3"
                        className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-none"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        disabled={catLoading}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
                      >
                        {catLoading ? 'Creating…' : 'Create Category'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Existing categories */}
                <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-white/60">
                    <h2 className="text-2xl font-bold text-gray-800">Existing Categories ({categories.length})</h2>
                  </div>
                  <div className="divide-y divide-white/40">
                    {categories.map((c) => (
                      <div key={c.categoryId} className="flex items-center justify-between px-6 py-4 hover:bg-white/30 transition-colors">
                        <div>
                          <h4 className="font-semibold text-gray-800">{c.categoryTitle}</h4>
                          <p className="text-sm text-gray-500">{c.categoryTagLine}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(c.categoryId)}
                          className="px-3 py-1 text-xs text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;