// MyPostsPage.jsx — NEW PAGE
// Shows only the logged-in user's posts.
// API: GET /api/post/user/{userId}/posts

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/postService';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const CATEGORY_META = {
  Technology:  { emoji: '💻', bg: 'bg-blue-100',   text: 'text-blue-700'   },
  Healthcare:  { emoji: '🏥', bg: 'bg-green-100',  text: 'text-green-700'  },
  Geopolitics: { emoji: '🌍', bg: 'bg-purple-100', text: 'text-purple-700' },
  Education:   { emoji: '📚', bg: 'bg-orange-100', text: 'text-orange-700' },
  Business:    { emoji: '💼', bg: 'bg-pink-100',   text: 'text-pink-700'   },
  Science:     { emoji: '🔬', bg: 'bg-indigo-100', text: 'text-indigo-700' },
};
const getMeta = (title) =>
  CATEGORY_META[title] || { emoji: '📌', bg: 'bg-gray-100', text: 'text-gray-700' };

const Skeleton = () => (
  <div className="bg-white/60 border border-white/60 rounded-2xl shadow p-6 animate-pulse space-y-3">
    <div className="h-5 bg-gray-100 rounded-full w-3/4"/>
    <div className="h-4 bg-gray-100 rounded-full w-full"/>
    <div className="h-4 bg-gray-100 rounded-full w-2/3"/>
    <div className="flex gap-3 pt-2">
      <div className="h-6 w-20 bg-blue-50 rounded-full"/>
      <div className="h-6 w-16 bg-gray-100 rounded-full ml-auto"/>
    </div>
  </div>
);

const MyPostsPage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!user?.userId) return;
    postService.getPostsByUser(user.userId)
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load your posts.'))
      .finally(() => setLoading(false));
  }, [user?.userId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-5" style={{ paddingLeft: "calc(var(--sidebar-w, 0px) + 20px)" }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/home')}
            className="p-2 rounded-full hover:bg-white/60 transition-colors text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">My Posts</h1>
            <p className="text-sm text-gray-500">All posts you've shared with the community</p>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold shadow">
            {posts.length} Post{posts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-50/80 border border-red-200 rounded-xl text-red-600 text-sm mb-6">
            ❌ {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i}/>)}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-16 text-center">
            <div className="text-7xl mb-6">📝</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No posts yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Share your knowledge or ask a question — your posts will appear here.
            </p>
            <button onClick={() => navigate('/home')}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300">
              ✍️ Create Your First Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => {
              const meta = getMeta(post.category?.categoryTitle);
              return (
                <div key={post.postId}
                  className="group bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 p-6">
                  {/* Category & date */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {post.category && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.bg} ${meta.text}`}>
                        {meta.emoji} {post.category.categoryTitle}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">{timeAgo(post.createdAt)}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">
                    {post.title}
                  </h3>

                  {/* Content preview */}
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
                    {post.content}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center gap-4 pt-3 border-t border-white/40">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      💬 {post.comment?.length || 0} comment{(post.comment?.length || 0) !== 1 ? 's' : ''}
                    </span>
                    {post.postImage && (
                      <span className="text-xs text-blue-500">📷 Has image</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPostsPage;