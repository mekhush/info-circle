// AllPostsPage.jsx — NEW PAGE
// "Explore All Posts" - sorted by recent or popularity
// API: GET /api/post/allPosts

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

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

const GRADIENTS = [
  'from-blue-500 to-purple-600', 'from-purple-500 to-pink-600',
  'from-green-500 to-teal-600',  'from-orange-500 to-red-600',
  'from-indigo-500 to-blue-600',
];
const avatarGradient = (id) => GRADIENTS[(id || 0) % GRADIENTS.length];

const Skeleton = () => (
  <div className="bg-white/60 border border-white/60 rounded-2xl shadow p-6 animate-pulse space-y-3">
    <div className="flex gap-3 items-center">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0"/>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-blue-100 rounded-full w-32"/>
        <div className="h-3 bg-gray-100 rounded-full w-20"/>
      </div>
    </div>
    <div className="h-5 bg-gray-100 rounded-full w-4/5"/>
    <div className="h-4 bg-gray-100 rounded-full w-full"/>
    <div className="h-4 bg-gray-100 rounded-full w-2/3"/>
  </div>
);

const AllPostsPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy]   = useState('recent'); // 'recent' | 'popular'
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    postService.getAllPosts(0, 50, 'postId', 'desc')
      .then(res => {
        const data = Array.isArray(res) ? res : (res.content || []);
        setPosts(data);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.comments?.length || 0) - (a.comments?.length || 0);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const toggleExpand = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

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
            <h1 className="text-2xl font-bold text-gray-800">Explore All Posts</h1>
            <p className="text-sm text-gray-500">{posts.length} posts in the community</p>
          </div>
        </div>

        {/* Sort controls */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'recent',  label: '🕐 Most Recent'  },
            { key: 'popular', label: '🔥 Most Popular' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setSortBy(key)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                sortBy === key
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'bg-white/60 border border-white/60 text-gray-600 hover:bg-white/80'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i}/>)}
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-16 text-center">
            <div className="text-7xl mb-6">🌱</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-6">Be the first to share something with the community!</p>
            <button onClick={() => navigate('/home')}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300">
              ✍️ Go to Home Feed
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPosts.map((post, idx) => {
              const meta   = getMeta(post.category?.categoryTitle);
              const author = post.user;
              const isLong = post.content?.length > 300;
              const isOpen = expanded[post.postId];

              return (
                <div key={post.postId}
                  className="group bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 p-6">
                  {/* Rank badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(author?.userId)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow`}>
                        {getInitials(author?.userName)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{author?.userName || 'Anonymous'}</p>
                        <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sortBy === 'popular' && (
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                          #{idx + 1}
                        </span>
                      )}
                      {post.category && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.bg} ${meta.text}`}>
                          {post.category.categoryImage
                            ? <img src={post.category.categoryImage} alt="" className="w-4 h-4 rounded-full object-cover" onError={e => { e.target.style.display='none'; }}/>
                            : meta.emoji
                          }
                          {post.category.categoryTitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    {isLong && !isOpen ? post.content.slice(0, 300) + '…' : post.content}
                  </p>
                  {isLong && (
                    <button onClick={() => toggleExpand(post.postId)}
                      className="text-xs text-purple-600 font-medium hover:underline mt-1">
                      {isOpen ? 'Show less' : 'Read more'}
                    </button>
                  )}

                  {/* Post image (R4) */}
                  {post.postImage && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-white/60">
                      <img
                        src={`http://localhost:8080/api/post/post/image/${post.postImage}`}
                        alt="Post media"
                        className="w-full max-h-72 object-cover"
                        onError={e => e.target.style.display='none'}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-3 mt-3 border-t border-white/40">
                    <span className="text-xs text-gray-400">
                      💬 {post.comments?.length || 0} thought{(post.comments?.length || 0) !== 1 ? 's' : ''}
                    </span>
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

export default AllPostsPage;