import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DarkModeToggle from '../../components/common/DarkModeToggle';

// ─── Category meta: emoji + colour per category title ─────────────────────────
const CATEGORY_META = {
  Technology:  { emoji: '💻', color: 'blue',   bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200'   },
  Healthcare:  { emoji: '🏥', color: 'green',  bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200'  },
  Geopolitics: { emoji: '🌍', color: 'purple', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  Education:   { emoji: '📚', color: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  Business:    { emoji: '💼', color: 'pink',   bg: 'bg-pink-100',   text: 'text-pink-700',   border: 'border-pink-200'   },
  Science:     { emoji: '🔬', color: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
};
const getCategoryMeta = (title) =>
  CATEGORY_META[title] || { emoji: '📌', color: 'gray', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };

// ─── Relative time helper ──────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

const AVATAR_GRADIENTS = [
  'from-blue-500 to-purple-600',
  'from-purple-500 to-pink-600',
  'from-green-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-indigo-500 to-blue-600',
];
const avatarGradient = (id) => AVATAR_GRADIENTS[(id || 0) % AVATAR_GRADIENTS.length];

// ─── Skeleton Loader ───────────────────────────────────────────────────────────
const PostSkeleton = () => (
  <div className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl shadow-lg overflow-hidden animate-pulse">
    <div className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded-full w-36" />
        <div className="h-3 bg-gray-100 rounded-full w-24" />
      </div>
    </div>
    <div className="w-full h-64 bg-gray-200" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded-full w-3/4" />
      <div className="h-3 bg-gray-100 rounded-full w-full" />
      <div className="h-3 bg-gray-100 rounded-full w-2/3" />
    </div>
  </div>
);

// ─── Post Composer ─────────────────────────────────────────────────────────────
const PostComposer = ({ user, categories, onPostCreated }) => {
  const [title, setTitle]       = useState('');
  const [content, setContent]   = useState('');
  const [catId, setCatId]       = useState('');
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');
  const [mediaFile, setMediaFile]     = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType]     = useState(null);
  const composerFileRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) { setError('Only images or videos supported.'); return; }
    if (file.size > (isVideo ? 50 : 10) * 1024 * 1024) { setError('File too large.'); return; }
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setError('');
    setMediaFile(file);
    setMediaType(isImage ? 'image' : 'video');
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleRemoveMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null); setMediaPreview(null); setMediaType(null);
    if (composerFileRef.current) composerFileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !catId) {
      setError('Please fill in all fields and select a category.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post(
        `/post/user/${user.userId}/category/${catId}/savePost`,
        { title: title.trim(), content: content.trim() }
      );
      let finalPost = res.data;
      if (mediaFile && mediaType === 'image') {
        try {
          const form = new FormData();
          form.append('image', mediaFile);
          const imgRes = await api.post(`/post/post/image/upload/${finalPost.postId}`, form, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          finalPost = imgRes.data;
        } catch { /* image upload failed silently */ }
      }
      onPostCreated(finalPost);
      setTitle(''); setContent(''); setCatId('');
      setExpanded(false);
      handleRemoveMedia();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-5 mb-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg`}>
          {getInitials(user?.userName)}
        </div>
        <button
          onClick={() => setExpanded(true)}
          className="flex-1 text-left px-5 py-3 rounded-full bg-white/60 border border-white/60 text-gray-400 hover:border-purple-300 hover:bg-white/80 transition-all duration-200 text-sm"
        >
          ✍️ &nbsp; Ask a question or share knowledge…
        </button>
      </div>

      {expanded && (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
          )}
          <input
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Title / Question headline…"
            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 text-sm transition-all"
          />
          <textarea
            value={content} onChange={e => setContent(e.target.value)}
            placeholder="Share your knowledge, ask a detailed question, or start a discussion…"
            rows={4}
            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 text-sm resize-none transition-all"
          />
          {mediaPreview && (
            <div className="relative rounded-xl overflow-hidden border border-white/60">
              {mediaType === 'image'
                ? <img src={mediaPreview} alt="Preview" className="w-full max-h-56 object-cover"/>
                : <video src={mediaPreview} controls className="w-full max-h-56"/>
              }
              <button type="button" onClick={handleRemoveMedia}
                className="absolute top-2 right-2 px-2 py-1 rounded-full bg-red-500/80 text-white text-xs font-semibold">
                ✕ Remove
              </button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <select value={catId} onChange={e => setCatId(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 text-sm transition-all">
              <option value="">📂 Select a category…</option>
              {categories.map(c => {
                const meta = getCategoryMeta(c.categoryTitle);
                return <option key={c.categoryId} value={c.categoryId}>{meta.emoji} {c.categoryTitle}</option>;
              })}
            </select>
            <div className="flex gap-2 self-end sm:self-auto items-center">
              <button type="button" onClick={() => composerFileRef.current?.click()}
                title="Add image or video"
                className="p-3 rounded-xl border border-gray-300 text-gray-500 text-sm hover:bg-gray-50 hover:text-purple-600 transition-all">
                📷
              </button>
              <input ref={composerFileRef} type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden"/>
              <button type="button" onClick={() => { setExpanded(false); setError(''); handleRemoveMedia(); }}
                className="px-5 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>Posting…
                  </span>
                ) : '🚀 Post'}
              </button>
            </div>
          </div>
        </form>
      )}

      {!expanded && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/40">
          <button onClick={() => setExpanded(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors">
            💡 Share Knowledge
          </button>
          <button onClick={() => setExpanded(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-pink-600 hover:bg-pink-50 transition-colors">
            📝 Write Article
          </button>
          <button onClick={() => setExpanded(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors ml-auto">
            📷 Add Media
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Comment Section ───────────────────────────────────────────────────────────
const CommentSection = ({ post, user }) => {
  const [comments, setComments]   = useState(Array.from(post.comments || post.comment || []));
  const [text, setText]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen]           = useState(false);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/comment/post/${post.postId}/saveComment`, {
        content: text.trim(),
        post: { postId: post.postId },
      });
      setComments(prev => [...prev, res.data]);
      setText('');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-700/50">
      {/* Like / Comment action row */}
      <div className="flex items-center gap-1 py-2">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          💬 {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all font-medium ml-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          Share
        </button>
      </div>

      {open && (
        <div className="mt-1 space-y-3">
          {comments.length === 0 && (
            <p className="text-sm text-gray-400 italic py-1 px-1">No comments yet. Be the first!</p>
          )}
          {comments.map(c => (
            <div key={c.commentId} className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                {getInitials(user?.userName)}
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-gray-800/60 rounded-2xl px-3 py-2">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{user?.userName || 'User'}
                  <span className="text-gray-400 font-normal ml-1.5">· {timeAgo(c.createdAt)}</span>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}

          <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>
              {getInitials(user?.userName)}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text" value={text} onChange={e => setText(e.target.value)}
                placeholder="Write a comment…"
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm transition-all"
              />
              <button type="submit" disabled={submitting || !text.trim()}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100">
                {submitting ? '…' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ─── Post Card — Instagram/Facebook style ──────────────────────────────────────
const PostCard = ({ post, user }) => {
  const [expanded, setExpanded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const meta   = getCategoryMeta(post.category?.categoryTitle);
  const author = post.user;
  const isLong = post.content?.length > 200;

  // Build full image URL
  const imageUrl = post.postImage
    ? (post.postImage.startsWith('http')
        ? post.postImage
        : `http://localhost:8080/api/post/post/image/${post.postImage}`)
    : null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/60 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(author?.userId)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md ring-2 ring-white dark:ring-gray-800`}>
          {author?.profileImage
            ? <img src={`/api/post/post/image/${author.profileImage}`} alt="" className="w-full h-full rounded-full object-cover"/>
            : getInitials(author?.userName)
          }
        </div>
        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate">
            {author?.userName || 'Anonymous'}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
            {post.category && (
              <>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${meta.bg} ${meta.text}`}>
                  {meta.emoji} {post.category.categoryTitle}
                </span>
              </>
            )}
          </div>
        </div>
        {/* Options */}
        <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* ── Title ── */}
      <div className="px-4 pb-2">
        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug">
          {post.title}
        </h3>
      </div>

      {/* ── Full-width Post Image (shown BEFORE description, like Instagram) ── */}
      {imageUrl && (
        <div className="w-full bg-gray-100 dark:bg-gray-800">
          <img
            src={imageUrl}
            alt={post.title}
            className={`w-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ maxHeight: '520px', minHeight: imgLoaded ? undefined : '300px' }}
            onLoad={() => setImgLoaded(true)}
            onError={e => { e.target.parentElement.style.display = 'none'; }}
          />
          {!imgLoaded && (
            <div className="w-full h-72 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
          )}
        </div>
      )}

      {/* ── Description / Content ── */}
      <div className="px-4 pt-3 pb-2">
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {isLong && !expanded ? (
            <>
              {post.content.slice(0, 200)}
              <span className="text-gray-400">… </span>
              <button onClick={() => setExpanded(true)} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline text-sm">
                more
              </button>
            </>
          ) : (
            <>
              {post.content}
              {isLong && (
                <button onClick={() => setExpanded(false)} className="ml-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline text-sm">
                  less
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Comments ── */}
      <CommentSection post={post} user={user} />
    </div>
  );
};

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyFeed = ({ onExplore }) => (
  <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-16 text-center">
    <div className="text-7xl mb-6">🌱</div>
    <h3 className="text-2xl font-bold text-gray-800 mb-3">No posts yet in this category</h3>
    <p className="text-gray-500 mb-8 max-w-sm mx-auto">Be the first to ask a question or share your knowledge!</p>
    <button onClick={onExplore}
      className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300">
      Explore All Posts
    </button>
  </div>
);

// ─── Main HomePage ─────────────────────────────────────────────────────────────
const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [searchParams]   = useSearchParams();

  const [posts, setPosts]               = useState([]);
  const [categories, setCategories]     = useState([]);
  const [activeCat, setActiveCat]       = useState(null);
  const [feedLoading, setFeedLoading]   = useState(true);
  const [catLoading, setCatLoading]     = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery]   = useState(searchParams.get('search') || '');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    api.get('/category/allCategories')
      .then(res => setCategories(res.data || []))
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  useEffect(() => {
    setFeedLoading(true);
    const endpoint = activeCat
      ? `/post/category/${activeCat}/posts`
      : '/post/allPosts';

    api.get(endpoint, activeCat ? {} : { params: { pageNumber: 0, pageSize: 500, sortBy: 'createdAt', sortDir: 'desc' } })
      .then(res => {
        const data = res.data;
        setPosts(Array.isArray(data) ? data : (data.content || []));
      })
      .catch((err) => { console.error("[Feed] FAILED:", err?.response?.status, err?.response?.data || err?.message); setPosts([]); })
      .finally(() => setFeedLoading(false));
  }, [activeCat]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    const debounce = setTimeout(() => {
      setSearchLoading(true);
      api.get(`/post/search/${encodeURIComponent(searchQuery.trim())}/posts`)
        .then(res => setSearchResults(Array.isArray(res.data) ? res.data : []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 400);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const handlePostCreated = (newPost) => setPosts(prev => [newPost, ...prev]);
  const displayedPosts = searchResults !== null ? searchResults : posts;
  const userPostCount = posts.filter(p => p.user?.userId === user?.userId).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

      {/* ═══ STICKY HEADER ══════════════════════════════════════════════════ */}
      <div className="fixed top-0 left-0 right-0 flex justify-center pt-5 z-50">
        <nav className="flex items-center justify-between gap-4 w-[92%] max-w-7xl px-6 py-3 rounded-full bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/40 shadow-xl">
          <a href="/home" className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-sm">IC</span>
            </div>
            <span className="hidden lg:block text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              InfoCircle
            </span>
          </a>

          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text" placeholder="Search questions, topics…"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') setSearchQuery(''); }}
                className="w-full pl-9 pr-8 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <button
              onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              ✍️ <span>Ask</span>
            </button>
            <button onClick={() => setSidebarOpen(v => !v)} className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setShowDropdown(v => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-colors">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-sm`}>
                  {getInitials(user?.userName)}
                </div>
                <span className="hidden lg:block text-gray-700 dark:text-gray-200 font-medium text-sm max-w-[100px] truncate">{user?.userName}</span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 py-2 rounded-2xl border border-gray-200 dark:border-gray-700 z-[9999]"
                  style={{ background: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)' }}>
                  <div className="px-4 py-3 mb-1 border-b border-gray-100">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-sm mb-2`}>
                      {getInitials(user?.userName)}
                    </div>
                    <p className="text-sm font-bold text-gray-900 truncate">{user?.userName}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{user?.bio || user?.city || 'InfoCircle Member'}</p>
                  </div>
                  <a href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-sm font-medium"><span>👤</span> My Profile</a>
                  <a href="/my-posts" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-sm font-medium"><span>📝</span> My Posts ({userPostCount})</a>
                  <a href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-sm font-medium"><span>⚙️</span> Settings</a>
                  <hr className="my-1 border-gray-100"/>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium">
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* ═══ MAIN LAYOUT ════════════════════════════════════════════════════ */}
      <div className="flex justify-center px-4 pt-28 pb-12">
        <div className="w-full max-w-7xl flex gap-6">

          {/* ─── LEFT SIDEBAR ──────────────────────────────────────────────── */}
          <aside className={`flex-shrink-0 w-64 space-y-4 ${sidebarOpen ? 'fixed inset-0 z-40 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl p-6 pt-24 overflow-y-auto' : 'hidden md:block sticky top-24 self-start'}`}>
            {sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} className="absolute top-20 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}

            {/* User Profile Card */}
            <div className="bg-white/40 dark:bg-gray-800/60 backdrop-blur-xl border border-white/60 dark:border-gray-700/40 rounded-2xl shadow-lg overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500" />
              <div className="px-5 pb-5">
                <div className={`-mt-7 w-14 h-14 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white dark:border-gray-800`}>
                  {getInitials(user?.userName)}
                </div>
                <h3 className="mt-2 font-bold text-gray-800 dark:text-white">{user?.userName}</h3>
                {user?.bio && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{user.bio}</p>}
                {user?.city && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><span>📍</span>{user.city}</p>}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="bg-blue-50/80 dark:bg-blue-900/30 rounded-xl p-2 text-center">
                    <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{userPostCount}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">My Posts</p>
                  </div>
                  <div className="bg-purple-50/80 dark:bg-purple-900/30 rounded-xl p-2 text-center">
                    <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{categories.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Categories</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white/40 dark:bg-gray-800/60 backdrop-blur-xl border border-white/60 dark:border-gray-700/40 rounded-2xl shadow-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Navigation</p>
              {[
                { icon: '🏠', label: 'Home Feed', href: '/home', active: true },
                { icon: '✍️', label: 'Create Post', href: '/create-post' },
                { icon: '👤', label: 'My Profile', href: '/profile' },
                { icon: '📝', label: 'My Posts', href: '/my-posts' },
                { icon: '🔔', label: 'Notifications', href: '/home' },
                { icon: '⚙️', label: 'Settings', href: '/settings' },
              ].map(item => (
                <a key={item.label} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                    item.active
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/40'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700/40 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}>
                  <span>{item.icon}</span>{item.label}
                  {item.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-600" />}
                </a>
              ))}
            </div>

            {/* Categories Sidebar */}
            <div className="bg-white/40 dark:bg-gray-800/60 backdrop-blur-xl border border-white/60 dark:border-gray-700/40 rounded-2xl shadow-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Categories</p>
              <button onClick={() => { setActiveCat(null); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
                  activeCat === null
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700/40'
                }`}>
                🌐 All Topics
              </button>
              {catLoading
                ? Array(5).fill(0).map((_, i) => <div key={i} className="h-9 mb-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl animate-pulse" />)
                : categories.map(cat => {
                    const meta = getCategoryMeta(cat.categoryTitle);
                    return (
                      <button key={cat.categoryId}
                        onClick={() => { setActiveCat(cat.categoryId); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
                          activeCat === cat.categoryId
                            ? `${meta.bg} ${meta.text} shadow-sm`
                            : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700/40'
                        }`}>
                        <span>{meta.emoji}</span>
                        <span className="truncate">{cat.categoryTitle}</span>
                      </button>
                    );
                  })
              }
            </div>
          </aside>

          {/* ─── CENTER FEED ───────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 space-y-4">

            {/* Hero */}
            <div className="bg-white/40 dark:bg-gray-800/60 backdrop-blur-xl border border-white/60 dark:border-gray-700/40 rounded-2xl shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-8 py-8">
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 text-xs font-semibold mb-4 shadow-md">
                    ✨ Welcome back, {user?.userName}!
                  </span>
                  <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-3 text-gray-900 dark:text-white">
                    Discover. Learn.
                    <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Share Knowledge.</span>
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
                    Explore thousands of questions across Technology, Healthcare, Education, and more.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                      ✍️ Share Your Thoughts
                    </button>
                    <button onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-6 py-2.5 rounded-full bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-300 text-sm font-semibold border-2 border-purple-200 dark:border-purple-700 shadow hover:border-purple-400 hover:shadow-lg hover:scale-105 transition-all duration-300">
                      📂 Browse Categories
                    </button>
                  </div>
                </div>
                <div className="relative flex-shrink-0 w-full md:w-64 h-44 hidden md:block">
                  <div className="absolute top-0 left-0 animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 shadow-xl text-center min-w-[130px]">
                      <div className="text-3xl mb-1">💡</div>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">10K+</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Questions Asked</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-0 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 shadow-xl text-center min-w-[130px]">
                      <div className="text-3xl mb-1">⚡</div>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">Fast</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Instant Answers</p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-8 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-700 shadow-xl text-center min-w-[130px]">
                      <div className="text-3xl mb-1">👥</div>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">5K+</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Active Users</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Browse */}
            <div id="categories-section" className="bg-white/40 dark:bg-gray-800/60 backdrop-blur-xl border border-white/60 dark:border-gray-700/40 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-extrabold mb-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                📂 Explore Popular Categories
              </h2>
              {catLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array(6).fill(0).map((_, i) => <div key={i} className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => { setActiveCat(null); document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className={`group relative aspect-square rounded-2xl cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${activeCat === null ? 'ring-2 ring-purple-500 ring-offset-2 shadow-xl' : 'shadow-md'}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, white 1px, transparent 1px), radial-gradient(circle at 70% 70%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">🌐</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 py-3">
                      <p className="text-white font-bold text-sm leading-tight truncate">All Topics</p>
                      <p className="text-white/70 text-xs mt-0.5 truncate">Everything</p>
                    </div>
                    {activeCat === null && <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-white shadow-lg" />}
                  </div>

                  {categories.map(cat => {
                    const meta = getCategoryMeta(cat.categoryTitle);
                    const isActive = activeCat === cat.categoryId;
                    return (
                      <div key={cat.categoryId}
                        onClick={() => { setActiveCat(cat.categoryId); document.getElementById('feed-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                        className={`group relative aspect-square rounded-2xl cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${isActive ? 'ring-2 ring-purple-500 ring-offset-2 shadow-xl' : 'shadow-md'}`}
                      >
                        {cat.categoryImage ? (
                          <img src={cat.categoryImage} alt={cat.categoryTitle}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={e => { e.target.style.display='none'; e.target.parentElement.querySelector('.cat-fallback-bg').style.display='flex'; }}
                          />
                        ) : null}
                        <div className={`cat-fallback-bg absolute inset-0 ${meta.bg} ${cat.categoryImage ? 'hidden' : 'flex'} items-center justify-center`}>
                          <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{meta.emoji}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 group-hover:from-black/90 group-hover:via-black/40 transition-all duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 px-3 py-3">
                          <p className="text-white font-bold text-sm leading-tight truncate drop-shadow-md">{cat.categoryTitle}</p>
                          <p className="text-white/70 text-xs mt-0.5 truncate">{cat.categoryTagLine || 'Explore discussions'}</p>
                        </div>
                        {isActive && <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-white shadow-lg" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Feed heading */}
            <div id="feed-section" className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-200 dark:via-purple-800 to-transparent" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                {activeCat
                  ? `${getCategoryMeta(categories.find(c => c.categoryId === activeCat)?.categoryTitle)?.emoji || ''} ${categories.find(c => c.categoryId === activeCat)?.categoryTitle || ''} Posts`
                  : '🌐 All Posts'}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-200 dark:via-purple-800 to-transparent" />
            </div>

            {/* Composer */}
            <div id="composer">
              <PostComposer user={user} categories={categories} onPostCreated={handlePostCreated} />
            </div>

            {/* Category filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button onClick={() => setActiveCat(null)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCat === null
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border border-white/60 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-700/60'
                }`}>
                🌐 All
              </button>
              {categories.map(cat => {
                const meta = getCategoryMeta(cat.categoryTitle);
                return (
                  <button key={cat.categoryId} onClick={() => setActiveCat(cat.categoryId)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      activeCat === cat.categoryId
                        ? `${meta.bg} ${meta.text} shadow-md border ${meta.border}`
                        : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border border-white/60 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-700/60'
                    }`}>
                    {meta.emoji} {cat.categoryTitle}
                  </button>
                );
              })}
            </div>

            {/* Search status */}
            {searchQuery && (
              <div className="flex items-center justify-between bg-white/40 dark:bg-gray-800/60 backdrop-blur-sm border border-white/60 dark:border-gray-700/40 rounded-xl px-4 py-2.5">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {searchLoading
                    ? <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Searching…</span>
                    : <>Results for <strong className="text-purple-700 dark:text-purple-400">"{searchQuery}"</strong> — {searchResults?.length ?? 0} found</>
                  }
                </p>
                <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-red-500 transition-colors">✕ Clear</button>
              </div>
            )}

            {/* Posts feed */}
            {feedLoading || searchLoading
              ? Array(4).fill(0).map((_, i) => <PostSkeleton key={i} />)
              : displayedPosts.length === 0
                ? <EmptyFeed onExplore={() => { setActiveCat(null); setSearchQuery(''); }} />
                : displayedPosts.map(post => <PostCard key={post.postId} post={post} user={user} />)
            }
          </main>

          {/* ─── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
          <aside className="hidden lg:block flex-shrink-0 w-72 sticky top-24 self-start space-y-4">
            <div className="bg-white/40 dark:bg-gray-800/60 backdrop-blur-xl border border-white/60 dark:border-gray-700/40 rounded-2xl shadow-lg p-5">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">🔥 <span>Trending Topics</span></h3>
              {catLoading
                ? Array(4).fill(0).map((_, i) => <div key={i} className="h-12 mb-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl animate-pulse" />)
                : categories.slice(0, 6).map((cat, idx) => {
                    const meta = getCategoryMeta(cat.categoryTitle);
                    return (
                      <button key={cat.categoryId} onClick={() => setActiveCat(cat.categoryId)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 group hover:shadow-md transition-all duration-200 ${
                          activeCat === cat.categoryId ? `${meta.bg} ${meta.text} shadow-sm` : 'hover:bg-white/60 dark:hover:bg-gray-700/40'
                        }`}>
                        <span className="text-2xl">{meta.emoji}</span>
                        <div className="flex-1 text-left">
                          <p className={`text-sm font-semibold ${activeCat === cat.categoryId ? meta.text : 'text-gray-700 dark:text-gray-300'} group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors`}>{cat.categoryTitle}</p>
                          <p className="text-xs text-gray-400">{cat.categoryTagLine || 'Explore discussions'}</p>
                        </div>
                        <span className={`text-xs font-bold ${meta.text} ${meta.bg} px-2 py-0.5 rounded-full`}>#{idx + 1}</span>
                      </button>
                    );
                  })
              }
            </div>

            <div className="bg-white/40 dark:bg-gray-800/60 backdrop-blur-xl border border-white/60 dark:border-gray-700/40 rounded-2xl shadow-lg p-5">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">📊 <span>Community Stats</span></h3>
              <div className="space-y-3">
                {[
                  { icon: '💡', label: 'Questions Asked', value: '10,000+' },
                  { icon: '⚡', label: 'Answers Given',   value: '45,000+' },
                  { icon: '👥', label: 'Active Members',  value: '5,000+' },
                  { icon: '📂', label: 'Categories',      value: `${categories.length}` },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center gap-3 py-2 border-b border-white/40 dark:border-gray-700/40 last:border-none">
                    <span className="text-xl">{stat.icon}</span>
                    <div className="flex-1"><p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p></div>
                    <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-5 text-white">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3">💡 Pro Tip</span>
              <h3 className="font-bold text-base mb-2">Get better answers faster</h3>
              <p className="text-white/80 text-xs leading-relaxed mb-4">Add a clear title, detailed context, and choose the right category. Well-framed questions get 3× more responses!</p>
              <button onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full py-2 rounded-xl bg-white text-purple-700 text-sm font-bold hover:shadow-lg hover:scale-105 transition-all duration-300">
                ✍️ Share Your Thoughts
              </button>
            </div>

            <div className="px-2">
              <p className="text-xs text-gray-400 leading-relaxed">
                <a href="/about" className="hover:text-purple-600 transition-colors">About</a>{' · '}
                <a href="/privacy" className="hover:text-purple-600 transition-colors">Privacy</a>{' · '}
                <a href="/terms" className="hover:text-purple-600 transition-colors">Terms</a>{' · '}
                <a href="/help" className="hover:text-purple-600 transition-colors">Help</a>
              </p>
              <p className="text-xs text-gray-300 mt-1">© 2026 InfoCircle</p>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default HomePage;
























// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate, useSearchParams, Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api';
// import DarkModeToggle from '../../components/common/DarkModeToggle';

// // ─── Category meta: emoji + colour per category title ─────────────────────────
// const CATEGORY_META = {
//   Technology:  { emoji: '💻', color: 'blue',   bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200'   },
//   Healthcare:  { emoji: '🏥', color: 'green',  bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200'  },
//   Geopolitics: { emoji: '🌍', color: 'purple', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
//   Education:   { emoji: '📚', color: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
//   Business:    { emoji: '💼', color: 'pink',   bg: 'bg-pink-100',   text: 'text-pink-700',   border: 'border-pink-200'   },
//   Science:     { emoji: '🔬', color: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
// };
// const getCategoryMeta = (title) =>
//   CATEGORY_META[title] || { emoji: '📌', color: 'gray', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };

// // ─── Relative time helper ──────────────────────────────────────────────────────
// const timeAgo = (dateStr) => {
//   if (!dateStr) return '';
//   const diff = (Date.now() - new Date(dateStr)) / 1000;
//   if (diff < 60)   return 'just now';
//   if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
//   if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
//   return `${Math.floor(diff / 86400)}d ago`;
// };

// // ─── User avatar initials ──────────────────────────────────────────────────────
// const getInitials = (name = '') =>
//   name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

// const AVATAR_GRADIENTS = [
//   'from-blue-500 to-purple-600',
//   'from-purple-500 to-pink-600',
//   'from-green-500 to-teal-600',
//   'from-orange-500 to-red-600',
//   'from-indigo-500 to-blue-600',
// ];
// const avatarGradient = (id) => AVATAR_GRADIENTS[(id || 0) % AVATAR_GRADIENTS.length];

// // ─── Skeleton Loader ───────────────────────────────────────────────────────────
// const PostSkeleton = () => (
//   <div className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl shadow-lg p-6 animate-pulse">
//     <div className="flex items-start gap-4 mb-4">
//       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex-shrink-0" />
//       <div className="flex-1 space-y-2 pt-1">
//         <div className="h-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-40" />
//         <div className="h-3 bg-gray-100 rounded-full w-24" />
//       </div>
//       <div className="h-6 w-20 bg-blue-50 rounded-full" />
//     </div>
//     <div className="space-y-2 mb-4">
//       <div className="h-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full w-4/5" />
//       <div className="h-4 bg-gray-100 rounded-full w-full" />
//       <div className="h-4 bg-gray-100 rounded-full w-3/4" />
//     </div>
//     <div className="flex gap-4 pt-3 border-t border-gray-100">
//       <div className="h-8 w-24 bg-gray-100 rounded-full" />
//       <div className="h-8 w-24 bg-gray-100 rounded-full" />
//       <div className="h-8 w-20 bg-gray-100 rounded-full ml-auto" />
//     </div>
//   </div>
// );

// // ─── Post Composer ─────────────────────────────────────────────────────────────
// const PostComposer = ({ user, categories, onPostCreated }) => {
//   const [title, setTitle]       = useState('');
//   const [content, setContent]   = useState('');
//   const [catId, setCatId]       = useState('');
//   const [expanded, setExpanded] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError]       = useState('');
//   const [mediaFile, setMediaFile]     = useState(null);
//   const [mediaPreview, setMediaPreview] = useState(null);
//   const [mediaType, setMediaType]     = useState(null);
//   const composerFileRef = React.useRef(null);

//   const handleFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const isImage = file.type.startsWith('image/');
//     const isVideo = file.type.startsWith('video/');
//     if (!isImage && !isVideo) { setError('Only images or videos supported.'); return; }
//     if (file.size > (isVideo ? 50 : 10) * 1024 * 1024) { setError('File too large.'); return; }
//     if (mediaPreview) URL.revokeObjectURL(mediaPreview);
//     setError('');
//     setMediaFile(file);
//     setMediaType(isImage ? 'image' : 'video');
//     setMediaPreview(URL.createObjectURL(file));
//   };

//   const handleRemoveMedia = () => {
//     if (mediaPreview) URL.revokeObjectURL(mediaPreview);
//     setMediaFile(null); setMediaPreview(null); setMediaType(null);
//     if (composerFileRef.current) composerFileRef.current.value = '';
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!title.trim() || !content.trim() || !catId) {
//       setError('Please fill in all fields and select a category.');
//       return;
//     }
//     setError('');
//     setSubmitting(true);
//     try {
//       const res = await api.post(
//         `/post/user/${user.userId}/category/${catId}/savePost`,
//         { title: title.trim(), content: content.trim() }
//       );
//       let finalPost = res.data;
//       // Upload image if selected
//       if (mediaFile && mediaType === 'image') {
//         try {
//           const form = new FormData();
//           form.append('image', mediaFile);
//           const imgRes = await api.post(`/post/post/image/upload/${finalPost.postId}`, form, {
//             headers: { 'Content-Type': 'multipart/form-data' }
//           });
//           finalPost = imgRes.data;
//         } catch { /* image upload failed silently */ }
//       }
//       onPostCreated(finalPost);
//       setTitle(''); setContent(''); setCatId('');
//       setExpanded(false);
//       handleRemoveMedia();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to post. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-5 mb-6">
//       {/* Composer top row */}
//       <div className="flex items-center gap-4">
//         <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg`}>
//           {getInitials(user?.userName)}
//         </div>
//         <button
//           onClick={() => setExpanded(true)}
//           className="flex-1 text-left px-5 py-3 rounded-full bg-white/60 border border-white/60 text-gray-400 hover:border-purple-300 hover:bg-white/80 transition-all duration-200 text-sm"
//         >
//           ✍️ &nbsp; Ask a question or share knowledge…
//         </button>
//       </div>

//       {/* Expanded form */}
//       {expanded && (
//         <form onSubmit={handleSubmit} className="mt-5 space-y-4">
//           {error && (
//             <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-red-600 text-sm">
//               {error}
//             </div>
//           )}

//           <input
//             type="text"
//             value={title}
//             onChange={e => setTitle(e.target.value)}
//             placeholder="Title / Question headline…"
//             className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 text-sm transition-all"
//           />

//           <textarea
//             value={content}
//             onChange={e => setContent(e.target.value)}
//             placeholder="Share your knowledge, ask a detailed question, or start a discussion…"
//             rows={4}
//             className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 text-sm resize-none transition-all"
//           />

//           {/* Media preview */}
//           {mediaPreview && (
//             <div className="relative rounded-xl overflow-hidden border border-white/60">
//               {mediaType === 'image'
//                 ? <img src={mediaPreview} alt="Preview" className="w-full max-h-56 object-cover"/>
//                 : <video src={mediaPreview} controls className="w-full max-h-56"/>
//               }
//               <button type="button" onClick={handleRemoveMedia}
//                 className="absolute top-2 right-2 px-2 py-1 rounded-full bg-red-500/80 text-white text-xs font-semibold">
//                 ✕ Remove
//               </button>
//             </div>
//           )}

//           <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
//             <select
//               value={catId}
//               onChange={e => setCatId(e.target.value)}
//               className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 text-sm transition-all"
//             >
//               <option value="">📂 Select a category…</option>
//               {categories.map(c => {
//                 const meta = getCategoryMeta(c.categoryTitle);
//                 return (
//                   <option key={c.categoryId} value={c.categoryId}>
//                     {meta.emoji} {c.categoryTitle}
//                   </option>
//                 );
//               })}
//             </select>

//             <div className="flex gap-2 self-end sm:self-auto items-center">
//               {/* Media attach button */}
//               <button type="button" onClick={() => composerFileRef.current?.click()}
//                 title="Add image or video"
//                 className="p-3 rounded-xl border border-gray-300 text-gray-500 text-sm hover:bg-gray-50 hover:text-purple-600 transition-all">
//                 📷
//               </button>
//               <input ref={composerFileRef} type="file" accept="image/*,video/*"
//                 onChange={handleFileChange} className="hidden"/>

//               <button
//                 type="button"
//                 onClick={() => { setExpanded(false); setError(''); handleRemoveMedia(); }}
//                 className="px-5 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
//               >
//                 {submitting ? (
//                   <span className="flex items-center gap-2">
//                     <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
//                     </svg>
//                     Posting…
//                   </span>
//                 ) : '🚀 Post'}
//               </button>
//             </div>
//           </div>
//         </form>
//       )}

//       {/* Quick action bar when collapsed */}
//       {!expanded && (
//         <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/40">
//           <button
//             onClick={() => setExpanded(true)}
//             className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
//           >
//             💡 Share Knowledge
//           </button>
//           <button
//             onClick={() => setExpanded(true)}
//             className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-pink-600 hover:bg-pink-50 transition-colors"
//           >
//             📝 Write Article
//           </button>
//           <button
//             onClick={() => setExpanded(true)}
//             className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors ml-auto"
//           >
//             📷 Add Media
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── Comment Section ───────────────────────────────────────────────────────────
// const CommentSection = ({ post, user }) => {
//   const [comments, setComments]   = useState(Array.from(post.comments || post.comment || []));
//   const [text, setText]           = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [open, setOpen]           = useState(false);

//   const handleAddComment = async (e) => {
//     e.preventDefault();
//     if (!text.trim()) return;
//     setSubmitting(true);
//     try {
//       const res = await api.post(`/comment/post/${post.postId}/saveComment`, {
//         content: text.trim(),
//         post: { postId: post.postId },
//       });
//       setComments(prev => [...prev, res.data]);
//       setText('');
//     } catch (err) {
//       // Show error to user instead of fake optimistic update
//       const errMsg = err?.response?.data?.message || 'Failed to save your thought. Please try again.';
//       alert(errMsg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="mt-4 pt-4 border-t border-white/40">
//       <button
//         onClick={() => setOpen(v => !v)}
//         className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors font-medium"
//       >
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
//         </svg>
//         💬 {comments.length} {comments.length === 1 ? "Thought" : "Thoughts"}
//         <svg className={`w-3 h-3 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
//         </svg>
//       </button>

//       {open && (
//         <div className="mt-3 space-y-3">
//           {/* Existing comments */}
//           {comments.length === 0 && (
//             <p className="text-sm text-gray-400 italic py-2">No answers yet. Be the first to respond!</p>
//           )}
//           {comments.map(c => (
//             <div key={c.commentId} className="flex gap-3 bg-white/40 rounded-xl p-3">
//               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
//                 {getInitials(user?.userName)}
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-700 mb-1">{user?.userName || 'User'} <span className="text-gray-400 font-normal">· {timeAgo(c.createdAt)}</span></p>
//                 <p className="text-sm text-gray-700">{c.content}</p>
//               </div>
//             </div>
//           ))}

//           {/* Add comment */}
//           <form onSubmit={handleAddComment} className="flex gap-2 mt-3">
//             <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
//               {getInitials(user?.userName)}
//             </div>
//             <input
//               type="text"
//               value={text}
//               onChange={e => setText(e.target.value)}
//               placeholder="Share your thoughts…"
//               className="flex-1 px-4 py-2 bg-white/60 border border-white/60 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm transition-all"
//             />
//             <button
//               type="submit"
//               disabled={submitting || !text.trim()}
//               className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100"
//             >
//               {submitting ? '…' : 'Post'}
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── Post Card ─────────────────────────────────────────────────────────────────
// const PostCard = ({ post, user }) => {
//   const [expanded, setExpanded] = useState(false);
//   const meta    = getCategoryMeta(post.category?.categoryTitle);
//   const author  = post.user;
//   const isLong  = post.content?.length > 280;

//   return (
//     <div className="group bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 p-6">
//       {/* Header */}
//       <div className="flex items-start justify-between gap-4 mb-4">
//         <div className="flex items-start gap-3">
//           <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient(author?.userId)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md`}>
//             {author?.profileImage
//               ? <img src={`/api/post/post/image/${author.profileImage}`} alt="" className="w-full h-full rounded-full object-cover"/>
//               : getInitials(author?.userName)
//             }
//           </div>
//           <div>
//             <p className="font-semibold text-gray-800 leading-tight">
//               {author?.userName || 'Anonymous'}
//             </p>
//             <div className="flex items-center gap-2 mt-0.5 flex-wrap">
//               <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
//               {post.category && (
//                 <>
//                   <span className="text-gray-300">·</span>
//                   <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.bg} ${meta.text}`}>
//                     {meta.emoji} {post.category.categoryTitle}
//                   </span>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Post image badge */}
//         {post.postImage && (
//           <span className="flex-shrink-0 px-2 py-1 rounded-full bg-blue-50 text-blue-500 text-xs font-medium">
//             📷 Image
//           </span>
//         )}
//       </div>

//       {/* Title */}
//       <h3 className="text-base font-bold text-gray-800 mb-2 leading-snug group-hover:text-purple-700 transition-colors cursor-pointer">
//         {post.title}
//       </h3>

//       {/* Content */}
//       <div className="text-sm text-gray-600 leading-relaxed mb-2">
//         {isLong && !expanded
//           ? <>{post.content.slice(0, 280)}<span className="text-gray-400">…</span></>
//           : post.content
//         }
//       </div>
//       {isLong && (
//         <button
//           onClick={() => setExpanded(v => !v)}
//           className="text-xs text-purple-600 font-medium hover:underline mb-3"
//         >
//           {expanded ? 'Show less' : 'Read more'}
//         </button>
//       )}

//       {/* Post Image */}
//       {post.postImage && (
//         <div className="mt-3 mb-3 rounded-xl overflow-hidden border border-white/60">
//           <img
//             src={`/api/post/post/image/${post.postImage}`}
//             alt="Post"
//             className="w-full max-h-80 object-cover"
//             onError={e => e.target.style.display = 'none'}
//           />
//         </div>
//       )}

//       {/* Comments */}
//       <CommentSection post={post} user={user} />
//     </div>
//   );
// };

// // ─── Empty State ───────────────────────────────────────────────────────────────
// const EmptyFeed = ({ onExplore }) => (
//   <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-16 text-center">
//     <div className="text-7xl mb-6">🌱</div>
//     <h3 className="text-2xl font-bold text-gray-800 mb-3">
//       No posts yet in this category
//     </h3>
//     <p className="text-gray-500 mb-8 max-w-sm mx-auto">
//       Be the first to ask a question or share your knowledge with the community!
//     </p>
//     <div className="flex gap-3 justify-center flex-wrap">
//       <button
//         onClick={onExplore}
//         className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
//       >
//         Explore All Posts
//       </button>
//     </div>
//   </div>
// );

// // ─── Main HomePage ─────────────────────────────────────────────────────────────
// const HomePage = () => {
//   const { user, logout } = useAuth();
//   const navigate         = useNavigate();
//   const [searchParams]   = useSearchParams();

//   // Feed state
//   const [posts, setPosts]         = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [activeCat, setActiveCat]   = useState(null); // null = All
//   const [feedLoading, setFeedLoading] = useState(true);
//   const [catLoading, setCatLoading]   = useState(true);

//   // Sidebar / UI state
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [searchQuery, setSearchQuery]   = useState(searchParams.get('search') || '');
//   const [searchResults, setSearchResults] = useState(null);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [sidebarOpen, setSidebarOpen]     = useState(false);

//   const dropdownRef = useRef(null);

//   // ── Load categories ────────────────────────────────────────────────────────
//   useEffect(() => {
//     api.get('/category/allCategories')
//       .then(res => setCategories(res.data || []))
//       .catch(() => setCategories([]))
//       .finally(() => setCatLoading(false));
//   }, []);

//   // ── Load posts (all or by category) ───────────────────────────────────────
//   useEffect(() => {
//     setFeedLoading(true);
//     const endpoint = activeCat
//       ? `/post/category/${activeCat}/posts`
//       : '/post/allPosts';

//     api.get(endpoint)
//       .then(res => {
//         const data = res.data;
//         // allPosts returns PostResponse with content array; category returns array directly
//         setPosts(Array.isArray(data) ? data : (data.content || []));
//       })
//       .catch(() => setPosts([]))
//       .finally(() => setFeedLoading(false));
//   }, [activeCat]);

//   // ── Search ─────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!searchQuery.trim()) { setSearchResults(null); return; }
//     const debounce = setTimeout(() => {
//       setSearchLoading(true);
//       api.get(`/post/search/${encodeURIComponent(searchQuery.trim())}/posts`)
//         .then(res => setSearchResults(Array.isArray(res.data) ? res.data : []))
//         .catch(() => setSearchResults([]))
//         .finally(() => setSearchLoading(false));
//     }, 400);
//     return () => clearTimeout(debounce);
//   }, [searchQuery]);

//   // ── Close dropdown on outside click ───────────────────────────────────────
//   useEffect(() => {
//     const handler = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const handleLogout = () => { logout(); navigate('/login'); };

//   const handlePostCreated = (newPost) => {
//     setPosts(prev => [newPost, ...prev]);
//   };

//   const displayedPosts = searchResults !== null ? searchResults : posts;

//   // ── Stats derived ──────────────────────────────────────────────────────────
//   const userPostCount = posts.filter(p => p.user?.userId === user?.userId).length;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

//       {/* ═══════════════════ STICKY HEADER ══════════════════════════════════ */}
//       <div className="fixed top-0 left-0 right-0 flex justify-center pt-5 z-50">
//         <nav className="flex items-center justify-between gap-4 w-[92%] max-w-7xl px-6 py-3 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl">

//           {/* Logo */}
//           <a href="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 flex-shrink-0">
//             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
//               <span className="text-white font-black text-sm">IC</span>
//             </div>
//             <span className="hidden lg:block text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//               InfoCircle
//             </span>
//           </a>

//           {/* Search */}
//           <div className="flex-1 max-w-md mx-2">
//             <div className="relative">
//               <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
//               </svg>
//               <input
//                 type="text"
//                 placeholder="Search questions, topics…"
//                 value={searchQuery}
//                 onChange={e => setSearchQuery(e.target.value)}
//                 onKeyDown={e => { if (e.key === 'Escape') setSearchQuery(''); }}
//                 className="w-full pl-9 pr-8 py-2 rounded-full border border-gray-200 bg-white/80 text-gray-700 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
//               />
//               {searchQuery && (
//                 <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//                   </svg>
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Right nav */}
//           <div className="flex items-center gap-2">
//             {/* Dark mode toggle */}
//             <DarkModeToggle />

//             {/* Ask Question CTA */}
//             <button
//               onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })}
//               className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
//             >
//               ✍️ <span>Ask</span>
//             </button>

//             {/* Mobile menu toggle */}
//             <button
//               onClick={() => setSidebarOpen(v => !v)}
//               className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
//             >
//               <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
//               </svg>
//             </button>

//             {/* User dropdown */}
//             <div className="relative" ref={dropdownRef}>
//               <button
//                 onClick={() => setShowDropdown(v => !v)}
//                 className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors"
//               >
//                 <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-sm`}>
//                   {getInitials(user?.userName)}
//                 </div>
//                 <span className="hidden lg:block text-gray-700 font-medium text-sm max-w-[100px] truncate">
//                   {user?.userName}
//                 </span>
//                 <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
//                 </svg>
//               </button>

//               {showDropdown && (
//                 <div className="absolute right-0 mt-2 w-52 py-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
//                   <div className="px-4 py-2 mb-1 border-b border-gray-100">
//                     <p className="text-sm font-semibold text-gray-800 truncate">{user?.userName}</p>
//                     <p className="text-xs text-gray-400 truncate">{user?.bio || user?.city || 'InfoCircle Member'}</p>
//                   </div>
//                   <a href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 transition-colors text-sm">
//                     <span>👤</span> My Profile
//                   </a>
//                   <a href="/my-posts" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 transition-colors text-sm">
//                     <span>📝</span> My Posts ({userPostCount})
//                   </a>
//                   <a href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 transition-colors text-sm">
//                     <span>⚙️</span> Settings
//                   </a>
//                   <hr className="my-1 border-gray-100"/>
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm"
//                   >
//                     <span>🚪</span> Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </nav>
//       </div>

//       {/* ═══════════════════ MAIN LAYOUT ════════════════════════════════════ */}
//       <div className="flex justify-center px-4 pt-28 pb-12">
//         <div className="w-full max-w-7xl flex gap-6">

//           {/* ─── LEFT SIDEBAR ──────────────────────────────────────────────── */}
//           <aside className={`
//             flex-shrink-0 w-64 space-y-4
//             ${sidebarOpen ? 'fixed inset-0 z-40 bg-white/80 backdrop-blur-xl p-6 pt-24 overflow-y-auto' : 'hidden md:block sticky top-24 self-start'}
//           `}>
//             {sidebarOpen && (
//               <button onClick={() => setSidebarOpen(false)} className="absolute top-20 right-4 p-2 rounded-full hover:bg-gray-100">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//                 </svg>
//               </button>
//             )}

//             {/* User Profile Card */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg overflow-hidden">
//               {/* Banner */}
//               <div className="h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500" />
//               {/* Avatar */}
//               <div className="px-5 pb-5">
//                 <div className={`-mt-7 w-14 h-14 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white`}>
//                   {getInitials(user?.userName)}
//                 </div>
//                 <h3 className="mt-2 font-bold text-gray-800">{user?.userName}</h3>
//                 {user?.bio && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{user.bio}</p>}
//                 {user?.city && (
//                   <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
//                     <span>📍</span>{user.city}
//                   </p>
//                 )}

//                 {/* Stats row */}
//                 <div className="mt-3 grid grid-cols-2 gap-2">
//                   <div className="bg-blue-50/80 rounded-xl p-2 text-center">
//                     <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{userPostCount}</p>
//                     <p className="text-xs text-gray-500">My Posts</p>
//                   </div>
//                   <div className="bg-purple-50/80 rounded-xl p-2 text-center">
//                     <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{categories.length}</p>
//                     <p className="text-xs text-gray-500">Categories</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Navigation */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-4">
//               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Navigation</p>
//               {[
//                 { icon: '🏠', label: 'Home Feed', href: '/home', active: true },
//                 { icon: '✍️', label: 'Create Post', href: '/create-post' },
//                 { icon: '👤', label: 'My Profile', href: '/profile' },
//                 { icon: '📝', label: 'My Posts', href: '/my-posts' },
//                 { icon: '🔔', label: 'Notifications', href: '/home' },
//                 { icon: '⚙️', label: 'Settings', href: '/settings' },
//               ].map(item => (
//                 <a
//                   key={item.label}
//                   href={item.href}
//                   onClick={item.scroll ? (e) => {
//                     e.preventDefault();
//                     document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' });
//                     setSidebarOpen(false);
//                   } : undefined}
//                   className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
//                     item.active
//                       ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 border border-purple-100'
//                       : 'text-gray-600 hover:bg-white/60 hover:text-purple-600'
//                   }`}
//                 >
//                   <span>{item.icon}</span>
//                   {item.label}
//                   {item.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-600" />}
//                 </a>
//               ))}
//             </div>

//             {/* Categories Sidebar */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-4">
//               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Categories</p>
//               <button
//                 onClick={() => { setActiveCat(null); setSidebarOpen(false); }}
//                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
//                   activeCat === null
//                     ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
//                     : 'text-gray-600 hover:bg-white/60'
//                 }`}
//               >
//                 🌐 All Topics
//               </button>
//               {catLoading
//                 ? Array(5).fill(0).map((_, i) => (
//                     <div key={i} className="h-9 mb-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl animate-pulse" />
//                   ))
//                 : categories.map(cat => {
//                     const meta = getCategoryMeta(cat.categoryTitle);
//                     return (
//                       <button
//                         key={cat.categoryId}
//                         onClick={() => { setActiveCat(cat.categoryId); setSidebarOpen(false); }}
//                         className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
//                           activeCat === cat.categoryId
//                             ? `${meta.bg} ${meta.text} shadow-sm`
//                             : 'text-gray-600 hover:bg-white/60'
//                         }`}
//                       >
//                         <span>{meta.emoji}</span>
//                         <span className="truncate">{cat.categoryTitle}</span>
//                       </button>
//                     );
//                   })
//               }
//             </div>
//           </aside>

//           {/* ─── CENTER FEED ───────────────────────────────────────────────── */}
//           <main className="flex-1 min-w-0 space-y-5">

//             {/* ═══ HERO SECTION — always visible at top of feed ═══════════ */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl overflow-hidden">
//               {/* Gradient banner strip */}
//               <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

//               <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-8 py-8">
//                 {/* Left — welcome copy */}
//                 <div className="flex-1 min-w-0">
//                   <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-blue-200 text-blue-600 text-xs font-semibold mb-4 shadow-md">
//                     ✨ Welcome back, {user?.userName}!
//                   </span>

//                   <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-3">
//                     Discover. Learn.
//                     <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//                       Share Knowledge.
//                     </span>
//                   </h1>

//                   <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-md">
//                     Explore thousands of questions across Technology, Healthcare, Education,
//                     and more. Share your expertise and learn from the community.
//                   </p>

//                   <div className="flex flex-wrap gap-3">
//                     <button
//                       onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })}
//                       className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
//                     >
//                       ✍️ Share Your Thoughts
//                     </button>
//                     <button
//                       onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
//                       className="px-6 py-2.5 rounded-full bg-white text-purple-600 text-sm font-semibold border-2 border-purple-200 shadow hover:border-purple-400 hover:shadow-lg hover:scale-105 transition-all duration-300"
//                     >
//                       📂 Browse Categories
//                     </button>
//                   </div>
//                 </div>

//                 {/* Right — floating stat cards */}
//                 <div className="relative flex-shrink-0 w-full md:w-64 h-44 hidden md:block">
//                   <div className="absolute top-0 left-0 animate-bounce" style={{ animationDuration: '3s' }}>
//                     <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-blue-200 shadow-xl text-center min-w-[130px]">
//                       <div className="text-3xl mb-1">💡</div>
//                       <p className="text-lg font-bold text-gray-800">10K+</p>
//                       <p className="text-xs text-gray-500">Questions Asked</p>
//                     </div>
//                   </div>
//                   <div className="absolute top-4 right-0 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
//                     <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-purple-200 shadow-xl text-center min-w-[130px]">
//                       <div className="text-3xl mb-1">⚡</div>
//                       <p className="text-lg font-bold text-gray-800">Fast</p>
//                       <p className="text-xs text-gray-500">Instant Answers</p>
//                     </div>
//                   </div>
//                   <div className="absolute bottom-0 left-8 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
//                     <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-pink-200 shadow-xl text-center min-w-[130px]">
//                       <div className="text-3xl mb-1">👥</div>
//                       <p className="text-lg font-bold text-gray-800">5K+</p>
//                       <p className="text-xs text-gray-500">Active Users</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* ═══ CATEGORIES BROWSE SECTION ══════════════════════════════════ */}
//             <div id="categories-section" className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-6">
//               <h2 className="text-xl font-extrabold mb-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//                 📂 Explore Popular Categories
//               </h2>

//               {catLoading ? (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                   {Array(6).fill(0).map((_, i) => (
//                     <div key={i} className="h-28 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl animate-pulse" />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                   {/* "All Topics" card */}
//                   <div
//                     onClick={() => { setActiveCat(null); document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' }); }}
//                     className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center ${
//                       activeCat === null
//                         ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-transparent text-white shadow-lg'
//                         : 'bg-white/80 border-gray-100 hover:border-purple-200'
//                     }`}
//                   >
//                     <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">🌐</div>
//                     <p className={`text-sm font-bold ${activeCat === null ? 'text-white' : 'text-gray-800'}`}>All Topics</p>
//                     <p className={`text-xs mt-0.5 ${activeCat === null ? 'text-white/70' : 'text-gray-400'}`}>Everything</p>
//                   </div>

//                   {/* Dynamic category cards from API */}
//                   {categories.map(cat => {
//                     const meta = getCategoryMeta(cat.categoryTitle);
//                     const isActive = activeCat === cat.categoryId;
//                     return (
//                       <div
//                         key={cat.categoryId}
//                         onClick={() => { setActiveCat(cat.categoryId); document.getElementById('feed-section')?.scrollIntoView({ behavior: 'smooth' }); }}
//                         className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center ${
//                           isActive
//                             ? `${meta.bg} border-transparent shadow-md`
//                             : 'bg-white/80 border-gray-100 hover:border-purple-200'
//                         }`}
//                       >
//                         {/* Show categoryImage if provided, else emoji */}
//                         <div className="mb-2 flex justify-center group-hover:scale-110 transition-transform duration-300">
//                           {cat.categoryImage
//                             ? <img src={cat.categoryImage} alt={cat.categoryTitle}
//                                 className="w-10 h-10 rounded-full object-cover shadow"
//                                 onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
//                               />
//                             : null
//                           }
//                           <span className={`text-3xl ${cat.categoryImage ? 'hidden' : ''}`}>{meta.emoji}</span>
//                         </div>
//                         <p className={`text-sm font-bold ${isActive ? meta.text : 'text-gray-800'}`}>
//                           {cat.categoryTitle}
//                         </p>
//                         <p className={`text-xs mt-0.5 ${isActive ? meta.text : 'text-gray-400'} line-clamp-1`}>
//                           {cat.categoryTagLine || 'Explore discussions'}
//                         </p>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>

//             {/* ═══ FEED HEADING ════════════════════════════════════════════════ */}
//             <div id="feed-section" className="flex items-center gap-3 pt-2">
//               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
//               <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
//                 {activeCat
//                   ? `${getCategoryMeta(categories.find(c => c.categoryId === activeCat)?.categoryTitle)?.emoji || ''} ${categories.find(c => c.categoryId === activeCat)?.categoryTitle || ''} Posts`
//                   : '🌐 All Posts'
//                 }
//               </span>
//               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
//             </div>

//             {/* Post Composer */}
//             <div id="composer">
//               <PostComposer user={user} categories={categories} onPostCreated={handlePostCreated} />
//             </div>

//             {/* Category Filter Tabs (horizontal scroll) */}
//             <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
//               <button
//                 onClick={() => setActiveCat(null)}
//                 className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
//                   activeCat === null
//                     ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
//                     : 'bg-white/60 text-gray-600 border border-white/60 hover:bg-white/80'
//                 }`}
//               >
//                 🌐 All
//               </button>
//               {categories.map(cat => {
//                 const meta = getCategoryMeta(cat.categoryTitle);
//                 return (
//                   <button
//                     key={cat.categoryId}
//                     onClick={() => setActiveCat(cat.categoryId)}
//                     className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
//                       activeCat === cat.categoryId
//                         ? `${meta.bg} ${meta.text} shadow-md border ${meta.border}`
//                         : 'bg-white/60 text-gray-600 border border-white/60 hover:bg-white/80'
//                     }`}
//                   >
//                     {meta.emoji} {cat.categoryTitle}
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Search status */}
//             {searchQuery && (
//               <div className="flex items-center justify-between bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-2.5">
//                 <p className="text-sm text-gray-600">
//                   {searchLoading
//                     ? <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Searching…</span>
//                     : <>Showing results for <strong className="text-purple-700">"{searchQuery}"</strong> — {searchResults?.length ?? 0} found</>
//                   }
//                 </p>
//                 <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
//                   ✕ Clear
//                 </button>
//               </div>
//             )}

//             {/* Feed */}
//             {feedLoading || searchLoading
//               ? Array(4).fill(0).map((_, i) => <PostSkeleton key={i} />)
//               : displayedPosts.length === 0
//                 ? <EmptyFeed onExplore={() => { setActiveCat(null); setSearchQuery(''); }} />
//                 : displayedPosts.map(post => (
//                     <PostCard key={post.postId} post={post} user={user} />
//                   ))
//             }
//           </main>

//           {/* ─── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
//           <aside className="hidden lg:block flex-shrink-0 w-72 sticky top-24 self-start space-y-4">

//             {/* Trending Categories */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-5">
//               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 🔥 <span>Trending Topics</span>
//               </h3>
//               {catLoading
//                 ? Array(4).fill(0).map((_, i) => (
//                     <div key={i} className="h-12 mb-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl animate-pulse" />
//                   ))
//                 : categories.slice(0, 6).map((cat, idx) => {
//                     const meta = getCategoryMeta(cat.categoryTitle);
//                     return (
//                       <button
//                         key={cat.categoryId}
//                         onClick={() => setActiveCat(cat.categoryId)}
//                         className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 group hover:shadow-md transition-all duration-200 ${
//                           activeCat === cat.categoryId
//                             ? `${meta.bg} ${meta.text} shadow-sm`
//                             : 'hover:bg-white/60'
//                         }`}
//                       >
//                         <span className="text-2xl">{meta.emoji}</span>
//                         <div className="flex-1 text-left">
//                           <p className={`text-sm font-semibold ${activeCat === cat.categoryId ? meta.text : 'text-gray-700'} group-hover:text-purple-700 transition-colors`}>
//                             {cat.categoryTitle}
//                           </p>
//                           <p className="text-xs text-gray-400">{cat.categoryTagLine || 'Explore discussions'}</p>
//                         </div>
//                         <span className={`text-xs font-bold ${meta.text} ${meta.bg} px-2 py-0.5 rounded-full`}>
//                           #{idx + 1}
//                         </span>
//                       </button>
//                     );
//                   })
//               }
//             </div>

//             {/* Platform stats */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-5">
//               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 📊 <span>Community Stats</span>
//               </h3>
//               <div className="space-y-3">
//                 {[
//                   { icon: '💡', label: 'Questions Asked', value: '10,000+' },
//                   { icon: '⚡', label: 'Answers Given',   value: '45,000+' },
//                   { icon: '👥', label: 'Active Members',  value: '5,000+' },
//                   { icon: '📂', label: 'Categories',      value: `${categories.length}` },
//                 ].map(stat => (
//                   <div key={stat.label} className="flex items-center gap-3 py-2 border-b border-white/40 last:border-none">
//                     <span className="text-xl">{stat.icon}</span>
//                     <div className="flex-1">
//                       <p className="text-xs text-gray-500">{stat.label}</p>
//                     </div>
//                     <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                       {stat.value}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Tips for new users */}
//             <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-5 text-white">
//               <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3">💡 Pro Tip</span>
//               <h3 className="font-bold text-base mb-2">Get better answers faster</h3>
//               <p className="text-white/80 text-xs leading-relaxed mb-4">
//                 Add a clear title, detailed context, and choose the right category. Well-framed questions get 3× more responses!
//               </p>
//               <button
//                 onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })}
//                 className="w-full py-2 rounded-xl bg-white text-purple-700 text-sm font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
//               >
//                 ✍️ Share Your Thoughts
//               </button>
//             </div>

//             {/* Footer links */}
//             <div className="px-2">
//               <p className="text-xs text-gray-400 leading-relaxed">
//                 <a href="/about" className="hover:text-purple-600 transition-colors">About</a>
//                 {' · '}
//                 <a href="/privacy" className="hover:text-purple-600 transition-colors">Privacy</a>
//                 {' · '}
//                 <a href="/terms" className="hover:text-purple-600 transition-colors">Terms</a>
//                 {' · '}
//                 <a href="/help" className="hover:text-purple-600 transition-colors">Help</a>
//               </p>
//               <p className="text-xs text-gray-300 mt-1">© 2026 InfoCircle</p>
//             </div>
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomePage;

// version Before Final.

// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate, useSearchParams, Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api';
// import DarkModeToggle from '../../components/common/DarkModeToggle';

// // ─── Category meta: emoji + colour per category title ─────────────────────────
// const CATEGORY_META = {
//   Technology:  { emoji: '💻', color: 'blue',   bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200'   },
//   Healthcare:  { emoji: '🏥', color: 'green',  bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200'  },
//   Geopolitics: { emoji: '🌍', color: 'purple', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
//   Education:   { emoji: '📚', color: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
//   Business:    { emoji: '💼', color: 'pink',   bg: 'bg-pink-100',   text: 'text-pink-700',   border: 'border-pink-200'   },
//   Science:     { emoji: '🔬', color: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
// };
// const getCategoryMeta = (title) =>
//   CATEGORY_META[title] || { emoji: '📌', color: 'gray', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };

// // ─── Relative time helper ──────────────────────────────────────────────────────
// const timeAgo = (dateStr) => {
//   if (!dateStr) return '';
//   const diff = (Date.now() - new Date(dateStr)) / 1000;
//   if (diff < 60)   return 'just now';
//   if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
//   if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
//   return `${Math.floor(diff / 86400)}d ago`;
// };

// // ─── User avatar initials ──────────────────────────────────────────────────────
// const getInitials = (name = '') =>
//   name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

// const AVATAR_GRADIENTS = [
//   'from-blue-500 to-purple-600',
//   'from-purple-500 to-pink-600',
//   'from-green-500 to-teal-600',
//   'from-orange-500 to-red-600',
//   'from-indigo-500 to-blue-600',
// ];
// const avatarGradient = (id) => AVATAR_GRADIENTS[(id || 0) % AVATAR_GRADIENTS.length];

// // ─── Skeleton Loader ───────────────────────────────────────────────────────────
// const PostSkeleton = () => (
//   <div className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl shadow-lg p-6 animate-pulse">
//     <div className="flex items-start gap-4 mb-4">
//       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex-shrink-0" />
//       <div className="flex-1 space-y-2 pt-1">
//         <div className="h-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-40" />
//         <div className="h-3 bg-gray-100 rounded-full w-24" />
//       </div>
//       <div className="h-6 w-20 bg-blue-50 rounded-full" />
//     </div>
//     <div className="space-y-2 mb-4">
//       <div className="h-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full w-4/5" />
//       <div className="h-4 bg-gray-100 rounded-full w-full" />
//       <div className="h-4 bg-gray-100 rounded-full w-3/4" />
//     </div>
//     <div className="flex gap-4 pt-3 border-t border-gray-100">
//       <div className="h-8 w-24 bg-gray-100 rounded-full" />
//       <div className="h-8 w-24 bg-gray-100 rounded-full" />
//       <div className="h-8 w-20 bg-gray-100 rounded-full ml-auto" />
//     </div>
//   </div>
// );

// // ─── Post Composer ─────────────────────────────────────────────────────────────
// const PostComposer = ({ user, categories, onPostCreated }) => {
//   const [title, setTitle]       = useState('');
//   const [content, setContent]   = useState('');
//   const [catId, setCatId]       = useState('');
//   const [expanded, setExpanded] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError]       = useState('');
//   const [mediaFile, setMediaFile]     = useState(null);
//   const [mediaPreview, setMediaPreview] = useState(null);
//   const [mediaType, setMediaType]     = useState(null);
//   const composerFileRef = React.useRef(null);

//   const handleFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const isImage = file.type.startsWith('image/');
//     const isVideo = file.type.startsWith('video/');
//     if (!isImage && !isVideo) { setError('Only images or videos supported.'); return; }
//     if (file.size > (isVideo ? 50 : 10) * 1024 * 1024) { setError('File too large.'); return; }
//     if (mediaPreview) URL.revokeObjectURL(mediaPreview);
//     setError('');
//     setMediaFile(file);
//     setMediaType(isImage ? 'image' : 'video');
//     setMediaPreview(URL.createObjectURL(file));
//   };

//   const handleRemoveMedia = () => {
//     if (mediaPreview) URL.revokeObjectURL(mediaPreview);
//     setMediaFile(null); setMediaPreview(null); setMediaType(null);
//     if (composerFileRef.current) composerFileRef.current.value = '';
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!title.trim() || !content.trim() || !catId) {
//       setError('Please fill in all fields and select a category.');
//       return;
//     }
//     setError('');
//     setSubmitting(true);
//     try {
//       const res = await api.post(
//         `/post/user/${user.userId}/category/${catId}/savePost`,
//         { title: title.trim(), content: content.trim() }
//       );
//       let finalPost = res.data;
//       // Upload image if selected
//       if (mediaFile && mediaType === 'image') {
//         try {
//           const form = new FormData();
//           form.append('image', mediaFile);
//           const imgRes = await api.post(`/post/post/image/upload/${finalPost.postId}`, form, {
//             headers: { 'Content-Type': 'multipart/form-data' }
//           });
//           finalPost = imgRes.data;
//         } catch { /* image upload failed silently */ }
//       }
//       onPostCreated(finalPost);
//       setTitle(''); setContent(''); setCatId('');
//       setExpanded(false);
//       handleRemoveMedia();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to post. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-5 mb-6">
//       {/* Composer top row */}
//       <div className="flex items-center gap-4">
//         <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg`}>
//           {getInitials(user?.userName)}
//         </div>
//         <button
//           onClick={() => setExpanded(true)}
//           className="flex-1 text-left px-5 py-3 rounded-full bg-white/60 border border-white/60 text-gray-400 hover:border-purple-300 hover:bg-white/80 transition-all duration-200 text-sm"
//         >
//           ✍️ &nbsp; Ask a question or share knowledge…
//         </button>
//       </div>

//       {/* Expanded form */}
//       {expanded && (
//         <form onSubmit={handleSubmit} className="mt-5 space-y-4">
//           {error && (
//             <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-red-600 text-sm">
//               {error}
//             </div>
//           )}

//           <input
//             type="text"
//             value={title}
//             onChange={e => setTitle(e.target.value)}
//             placeholder="Title / Question headline…"
//             className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 text-sm transition-all"
//           />

//           <textarea
//             value={content}
//             onChange={e => setContent(e.target.value)}
//             placeholder="Share your knowledge, ask a detailed question, or start a discussion…"
//             rows={4}
//             className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 text-sm resize-none transition-all"
//           />

//           {/* Media preview */}
//           {mediaPreview && (
//             <div className="relative rounded-xl overflow-hidden border border-white/60">
//               {mediaType === 'image'
//                 ? <img src={mediaPreview} alt="Preview" className="w-full max-h-56 object-cover"/>
//                 : <video src={mediaPreview} controls className="w-full max-h-56"/>
//               }
//               <button type="button" onClick={handleRemoveMedia}
//                 className="absolute top-2 right-2 px-2 py-1 rounded-full bg-red-500/80 text-white text-xs font-semibold">
//                 ✕ Remove
//               </button>
//             </div>
//           )}

//           <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
//             <select
//               value={catId}
//               onChange={e => setCatId(e.target.value)}
//               className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 text-sm transition-all"
//             >
//               <option value="">📂 Select a category…</option>
//               {categories.map(c => {
//                 const meta = getCategoryMeta(c.categoryTitle);
//                 return (
//                   <option key={c.categoryId} value={c.categoryId}>
//                     {meta.emoji} {c.categoryTitle}
//                   </option>
//                 );
//               })}
//             </select>

//             <div className="flex gap-2 self-end sm:self-auto items-center">
//               {/* Media attach button */}
//               <button type="button" onClick={() => composerFileRef.current?.click()}
//                 title="Add image or video"
//                 className="p-3 rounded-xl border border-gray-300 text-gray-500 text-sm hover:bg-gray-50 hover:text-purple-600 transition-all">
//                 📷
//               </button>
//               <input ref={composerFileRef} type="file" accept="image/*,video/*"
//                 onChange={handleFileChange} className="hidden"/>

//               <button
//                 type="button"
//                 onClick={() => { setExpanded(false); setError(''); handleRemoveMedia(); }}
//                 className="px-5 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
//               >
//                 {submitting ? (
//                   <span className="flex items-center gap-2">
//                     <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
//                     </svg>
//                     Posting…
//                   </span>
//                 ) : '🚀 Post'}
//               </button>
//             </div>
//           </div>
//         </form>
//       )}

//       {/* Quick action bar when collapsed */}
//       {!expanded && (
//         <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/40">
//           <button
//             onClick={() => setExpanded(true)}
//             className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
//           >
//             💡 Share Knowledge
//           </button>
//           <button
//             onClick={() => setExpanded(true)}
//             className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-pink-600 hover:bg-pink-50 transition-colors"
//           >
//             📝 Write Article
//           </button>
//           <button
//             onClick={() => setExpanded(true)}
//             className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors ml-auto"
//           >
//             📷 Add Media
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── Comment Section ───────────────────────────────────────────────────────────
// const CommentSection = ({ post, user }) => {
//   const [comments, setComments]   = useState(Array.from(post.comments || post.comment || []));
//   const [text, setText]           = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [open, setOpen]           = useState(false);

//   const handleAddComment = async (e) => {
//     e.preventDefault();
//     if (!text.trim()) return;
//     setSubmitting(true);
//     try {
//       const res = await api.post(`/comment/post/${post.postId}/saveComment`, {
//         content: text.trim(),
//         post: { postId: post.postId },
//       });
//       setComments(prev => [...prev, res.data]);
//       setText('');
//     } catch (err) {
//       // Show error to user instead of fake optimistic update
//       const errMsg = err?.response?.data?.message || 'Failed to save your thought. Please try again.';
//       alert(errMsg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="mt-4 pt-4 border-t border-white/40">
//       <button
//         onClick={() => setOpen(v => !v)}
//         className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors font-medium"
//       >
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
//         </svg>
//         💬 {comments.length} {comments.length === 1 ? "Thought" : "Thoughts"}
//         <svg className={`w-3 h-3 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
//         </svg>
//       </button>

//       {open && (
//         <div className="mt-3 space-y-3">
//           {/* Existing comments */}
//           {comments.length === 0 && (
//             <p className="text-sm text-gray-400 italic py-2">No answers yet. Be the first to respond!</p>
//           )}
//           {comments.map(c => (
//             <div key={c.commentId} className="flex gap-3 bg-white/40 rounded-xl p-3">
//               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
//                 {getInitials(user?.userName)}
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-700 mb-1">{user?.userName || 'User'} <span className="text-gray-400 font-normal">· {timeAgo(c.createdAt)}</span></p>
//                 <p className="text-sm text-gray-700">{c.content}</p>
//               </div>
//             </div>
//           ))}

//           {/* Add comment */}
//           <form onSubmit={handleAddComment} className="flex gap-2 mt-3">
//             <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
//               {getInitials(user?.userName)}
//             </div>
//             <input
//               type="text"
//               value={text}
//               onChange={e => setText(e.target.value)}
//               placeholder="Share your thoughts…"
//               className="flex-1 px-4 py-2 bg-white/60 border border-white/60 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm transition-all"
//             />
//             <button
//               type="submit"
//               disabled={submitting || !text.trim()}
//               className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100"
//             >
//               {submitting ? '…' : 'Post'}
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── Post Card ─────────────────────────────────────────────────────────────────
// const PostCard = ({ post, user }) => {
//   const [expanded, setExpanded] = useState(false);
//   const meta    = getCategoryMeta(post.category?.categoryTitle);
//   const author  = post.user;
//   const isLong  = post.content?.length > 280;

//   return (
//     <div className="group bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 p-6">
//       {/* Header */}
//       <div className="flex items-start justify-between gap-4 mb-4">
//         <div className="flex items-start gap-3">
//           <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient(author?.userId)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md`}>
//             {author?.profileImage
//               ? <img src={`/api/post/post/image/${author.profileImage}`} alt="" className="w-full h-full rounded-full object-cover"/>
//               : getInitials(author?.userName)
//             }
//           </div>
//           <div>
//             <p className="font-semibold text-gray-800 leading-tight">
//               {author?.userName || 'Anonymous'}
//             </p>
//             <div className="flex items-center gap-2 mt-0.5 flex-wrap">
//               <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
//               {post.category && (
//                 <>
//                   <span className="text-gray-300">·</span>
//                   <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.bg} ${meta.text}`}>
//                     {meta.emoji} {post.category.categoryTitle}
//                   </span>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Post image badge */}
//         {post.postImage && (
//           <span className="flex-shrink-0 px-2 py-1 rounded-full bg-blue-50 text-blue-500 text-xs font-medium">
//             📷 Image
//           </span>
//         )}
//       </div>

//       {/* Title */}
//       <h3 className="text-base font-bold text-gray-800 mb-2 leading-snug group-hover:text-purple-700 transition-colors cursor-pointer">
//         {post.title}
//       </h3>

//       {/* Content */}
//       <div className="text-sm text-gray-600 leading-relaxed mb-2">
//         {isLong && !expanded
//           ? <>{post.content.slice(0, 280)}<span className="text-gray-400">…</span></>
//           : post.content
//         }
//       </div>
//       {isLong && (
//         <button
//           onClick={() => setExpanded(v => !v)}
//           className="text-xs text-purple-600 font-medium hover:underline mb-3"
//         >
//           {expanded ? 'Show less' : 'Read more'}
//         </button>
//       )}

//       {/* Post Image */}
//       {post.postImage && (
//         <div className="mt-3 mb-3 rounded-xl overflow-hidden border border-white/60">
//           <img
//             src={`/api/post/post/image/${post.postImage}`}
//             alt="Post"
//             className="w-full max-h-80 object-cover"
//             onError={e => e.target.style.display = 'none'}
//           />
//         </div>
//       )}

//       {/* Comments */}
//       <CommentSection post={post} user={user} />
//     </div>
//   );
// };

// // ─── Empty State ───────────────────────────────────────────────────────────────
// const EmptyFeed = ({ onExplore }) => (
//   <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-16 text-center">
//     <div className="text-7xl mb-6">🌱</div>
//     <h3 className="text-2xl font-bold text-gray-800 mb-3">
//       No posts yet in this category
//     </h3>
//     <p className="text-gray-500 mb-8 max-w-sm mx-auto">
//       Be the first to ask a question or share your knowledge with the community!
//     </p>
//     <div className="flex gap-3 justify-center flex-wrap">
//       <button
//         onClick={onExplore}
//         className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
//       >
//         Explore All Posts
//       </button>
//     </div>
//   </div>
// );

// // ─── Main HomePage ─────────────────────────────────────────────────────────────
// const HomePage = () => {
//   const { user, logout } = useAuth();
//   const navigate         = useNavigate();
//   const [searchParams]   = useSearchParams();

//   // Feed state
//   const [posts, setPosts]         = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [activeCat, setActiveCat]   = useState(null); // null = All
//   const [feedLoading, setFeedLoading] = useState(true);
//   const [catLoading, setCatLoading]   = useState(true);

//   // Sidebar / UI state
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [searchQuery, setSearchQuery]   = useState(searchParams.get('search') || '');
//   const [searchResults, setSearchResults] = useState(null);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [sidebarOpen, setSidebarOpen]     = useState(false);

//   const dropdownRef = useRef(null);

//   // ── Load categories ────────────────────────────────────────────────────────
//   useEffect(() => {
//     api.get('/category/allCategories')
//       .then(res => setCategories(res.data || []))
//       .catch(() => setCategories([]))
//       .finally(() => setCatLoading(false));
//   }, []);

//   // ── Load posts (all or by category) ───────────────────────────────────────
//   useEffect(() => {
//     setFeedLoading(true);
//     const endpoint = activeCat
//       ? `/post/category/${activeCat}/posts`
//       : '/post/allPosts';

//     api.get(endpoint)
//       .then(res => {
//         const data = res.data;
//         // allPosts returns PostResponse with content array; category returns array directly
//         setPosts(Array.isArray(data) ? data : (data.content || []));
//       })
//       .catch(() => setPosts([]))
//       .finally(() => setFeedLoading(false));
//   }, [activeCat]);

//   // ── Search ─────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!searchQuery.trim()) { setSearchResults(null); return; }
//     const debounce = setTimeout(() => {
//       setSearchLoading(true);
//       api.get(`/post/search/${encodeURIComponent(searchQuery.trim())}/posts`)
//         .then(res => setSearchResults(Array.isArray(res.data) ? res.data : []))
//         .catch(() => setSearchResults([]))
//         .finally(() => setSearchLoading(false));
//     }, 400);
//     return () => clearTimeout(debounce);
//   }, [searchQuery]);

//   // ── Close dropdown on outside click ───────────────────────────────────────
//   useEffect(() => {
//     const handler = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const handleLogout = () => { logout(); navigate('/login'); };

//   const handlePostCreated = (newPost) => {
//     setPosts(prev => [newPost, ...prev]);
//   };

//   const displayedPosts = searchResults !== null ? searchResults : posts;

//   // ── Stats derived ──────────────────────────────────────────────────────────
//   const userPostCount = posts.filter(p => p.user?.userId === user?.userId).length;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

//       {/* ═══════════════════ STICKY HEADER ══════════════════════════════════ */}
//       <div className="fixed top-0 left-0 right-0 flex justify-center pt-5 z-50">
//         <nav className="flex items-center justify-between gap-4 w-[92%] max-w-7xl px-6 py-3 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl">

//           {/* Logo */}
//           <a href="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 flex-shrink-0">
//             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
//               <span className="text-white font-black text-sm">IC</span>
//             </div>
//             <span className="hidden lg:block text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//               InfoCircle
//             </span>
//           </a>

//           {/* Search */}
//           <div className="flex-1 max-w-md mx-2">
//             <div className="relative">
//               <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
//               </svg>
//               <input
//                 type="text"
//                 placeholder="Search questions, topics…"
//                 value={searchQuery}
//                 onChange={e => setSearchQuery(e.target.value)}
//                 onKeyDown={e => { if (e.key === 'Escape') setSearchQuery(''); }}
//                 className="w-full pl-9 pr-8 py-2 rounded-full border border-gray-200 bg-white/80 text-gray-700 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
//               />
//               {searchQuery && (
//                 <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//                   </svg>
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Right nav */}
//           <div className="flex items-center gap-2">
//             {/* Dark mode toggle */}
//             <DarkModeToggle />

//             {/* Ask Question CTA */}
//             <button
//               onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })}
//               className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
//             >
//               ✍️ <span>Ask</span>
//             </button>

//             {/* Mobile menu toggle */}
//             <button
//               onClick={() => setSidebarOpen(v => !v)}
//               className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
//             >
//               <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
//               </svg>
//             </button>

//             {/* User dropdown */}
//             <div className="relative" ref={dropdownRef}>
//               <button
//                 onClick={() => setShowDropdown(v => !v)}
//                 className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors"
//               >
//                 <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-sm`}>
//                   {getInitials(user?.userName)}
//                 </div>
//                 <span className="hidden lg:block text-gray-700 font-medium text-sm max-w-[100px] truncate">
//                   {user?.userName}
//                 </span>
//                 <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
//                 </svg>
//               </button>

//               {showDropdown && (
//                 <div className="absolute right-0 mt-2 w-56 py-2 rounded-2xl border border-gray-200 z-[9999]"
//                   style={{
//                     background: 'white',
//                     boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
//                     isolation: 'isolate',
//                   }}
//                 >
//                   {/* Header */}
//                   <div className="px-4 py-3 mb-1 border-b border-gray-100">
//                     <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-sm mb-2`}>
//                       {getInitials(user?.userName)}
//                     </div>
//                     <p className="text-sm font-bold text-gray-900 truncate">{user?.userName}</p>
//                     <p className="text-xs text-gray-400 truncate mt-0.5">{user?.bio || user?.city || 'InfoCircle Member'}</p>
//                   </div>

//                   {/* Nav links */}
//                   <a href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-sm font-medium">
//                     <span>👤</span> My Profile
//                   </a>
//                   <a href="/my-posts" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-sm font-medium">
//                     <span>📝</span> My Posts ({userPostCount})
//                   </a>
//                   <a href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-sm font-medium">
//                     <span>⚙️</span> Settings
//                   </a>

//                   <hr className="my-1 border-gray-100"/>

//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
//                   >
//                     <span>🚪</span> Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </nav>
//       </div>

//       {/* ═══════════════════ MAIN LAYOUT ════════════════════════════════════ */}
//       <div className="flex justify-center px-4 pt-28 pb-12">
//         <div className="w-full max-w-7xl flex gap-6">

//           {/* ─── LEFT SIDEBAR ──────────────────────────────────────────────── */}
//           <aside className={`
//             flex-shrink-0 w-64 space-y-4
//             ${sidebarOpen ? 'fixed inset-0 z-40 bg-white/80 backdrop-blur-xl p-6 pt-24 overflow-y-auto' : 'hidden md:block sticky top-24 self-start'}
//           `}>
//             {sidebarOpen && (
//               <button onClick={() => setSidebarOpen(false)} className="absolute top-20 right-4 p-2 rounded-full hover:bg-gray-100">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//                 </svg>
//               </button>
//             )}

//             {/* User Profile Card */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg overflow-hidden">
//               {/* Banner */}
//               <div className="h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500" />
//               {/* Avatar */}
//               <div className="px-5 pb-5">
//                 <div className={`-mt-7 w-14 h-14 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white`}>
//                   {getInitials(user?.userName)}
//                 </div>
//                 <h3 className="mt-2 font-bold text-gray-800">{user?.userName}</h3>
//                 {user?.bio && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{user.bio}</p>}
//                 {user?.city && (
//                   <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
//                     <span>📍</span>{user.city}
//                   </p>
//                 )}

//                 {/* Stats row */}
//                 <div className="mt-3 grid grid-cols-2 gap-2">
//                   <div className="bg-blue-50/80 rounded-xl p-2 text-center">
//                     <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{userPostCount}</p>
//                     <p className="text-xs text-gray-500">My Posts</p>
//                   </div>
//                   <div className="bg-purple-50/80 rounded-xl p-2 text-center">
//                     <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{categories.length}</p>
//                     <p className="text-xs text-gray-500">Categories</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Navigation */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-4">
//               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Navigation</p>
//               {[
//                 { icon: '🏠', label: 'Home Feed', href: '/home', active: true },
//                 { icon: '✍️', label: 'Create Post', href: '/create-post' },
//                 { icon: '👤', label: 'My Profile', href: '/profile' },
//                 { icon: '📝', label: 'My Posts', href: '/my-posts' },
//                 { icon: '🔔', label: 'Notifications', href: '/home' },
//                 { icon: '⚙️', label: 'Settings', href: '/settings' },
//               ].map(item => (
//                 <a
//                   key={item.label}
//                   href={item.href}
//                   onClick={item.scroll ? (e) => {
//                     e.preventDefault();
//                     document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' });
//                     setSidebarOpen(false);
//                   } : undefined}
//                   className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
//                     item.active
//                       ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 border border-purple-100'
//                       : 'text-gray-600 hover:bg-white/60 hover:text-purple-600'
//                   }`}
//                 >
//                   <span>{item.icon}</span>
//                   {item.label}
//                   {item.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-600" />}
//                 </a>
//               ))}
//             </div>

//             {/* Categories Sidebar */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-4">
//               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Categories</p>
//               <button
//                 onClick={() => { setActiveCat(null); setSidebarOpen(false); }}
//                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
//                   activeCat === null
//                     ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
//                     : 'text-gray-600 hover:bg-white/60'
//                 }`}
//               >
//                 🌐 All Topics
//               </button>
//               {catLoading
//                 ? Array(5).fill(0).map((_, i) => (
//                     <div key={i} className="h-9 mb-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl animate-pulse" />
//                   ))
//                 : categories.map(cat => {
//                     const meta = getCategoryMeta(cat.categoryTitle);
//                     return (
//                       <button
//                         key={cat.categoryId}
//                         onClick={() => { setActiveCat(cat.categoryId); setSidebarOpen(false); }}
//                         className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
//                           activeCat === cat.categoryId
//                             ? `${meta.bg} ${meta.text} shadow-sm`
//                             : 'text-gray-600 hover:bg-white/60'
//                         }`}
//                       >
//                         <span>{meta.emoji}</span>
//                         <span className="truncate">{cat.categoryTitle}</span>
//                       </button>
//                     );
//                   })
//               }
//             </div>
//           </aside>

//           {/* ─── CENTER FEED ───────────────────────────────────────────────── */}
//           <main className="flex-1 min-w-0 space-y-5">

//             {/* ═══ HERO SECTION — always visible at top of feed ═══════════ */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl overflow-hidden">
//               {/* Gradient banner strip */}
//               <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

//               <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-8 py-8">
//                 {/* Left — welcome copy */}
//                 <div className="flex-1 min-w-0">
//                   <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-blue-200 text-blue-600 text-xs font-semibold mb-4 shadow-md">
//                     ✨ Welcome back, {user?.userName}!
//                   </span>

//                   <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-3">
//                     Discover. Learn.
//                     <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//                       Share Knowledge.
//                     </span>
//                   </h1>

//                   <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-md">
//                     Explore thousands of questions across Technology, Healthcare, Education,
//                     and more. Share your expertise and learn from the community.
//                   </p>

//                   <div className="flex flex-wrap gap-3">
//                     <button
//                       onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })}
//                       className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
//                     >
//                       ✍️ Share Your Thoughts
//                     </button>
//                     <button
//                       onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
//                       className="px-6 py-2.5 rounded-full bg-white text-purple-600 text-sm font-semibold border-2 border-purple-200 shadow hover:border-purple-400 hover:shadow-lg hover:scale-105 transition-all duration-300"
//                     >
//                       📂 Browse Categories
//                     </button>
//                   </div>
//                 </div>

//                 {/* Right — floating stat cards */}
//                 <div className="relative flex-shrink-0 w-full md:w-64 h-44 hidden md:block">
//                   <div className="absolute top-0 left-0 animate-bounce" style={{ animationDuration: '3s' }}>
//                     <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-blue-200 shadow-xl text-center min-w-[130px]">
//                       <div className="text-3xl mb-1">💡</div>
//                       <p className="text-lg font-bold text-gray-800">10K+</p>
//                       <p className="text-xs text-gray-500">Questions Asked</p>
//                     </div>
//                   </div>
//                   <div className="absolute top-4 right-0 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
//                     <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-purple-200 shadow-xl text-center min-w-[130px]">
//                       <div className="text-3xl mb-1">⚡</div>
//                       <p className="text-lg font-bold text-gray-800">Fast</p>
//                       <p className="text-xs text-gray-500">Instant Answers</p>
//                     </div>
//                   </div>
//                   <div className="absolute bottom-0 left-8 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
//                     <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-pink-200 shadow-xl text-center min-w-[130px]">
//                       <div className="text-3xl mb-1">👥</div>
//                       <p className="text-lg font-bold text-gray-800">5K+</p>
//                       <p className="text-xs text-gray-500">Active Users</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* ═══ CATEGORIES BROWSE SECTION ══════════════════════════════════ */}
//             <div id="categories-section" className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-6">
//               <h2 className="text-xl font-extrabold mb-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//                 📂 Explore Popular Categories
//               </h2>

//               {catLoading ? (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                   {Array(6).fill(0).map((_, i) => (
//                     <div key={i} className="h-28 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl animate-pulse" />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                   {/* "All Topics" card */}
//                   <div
//                     onClick={() => { setActiveCat(null); document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' }); }}
//                     className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center ${
//                       activeCat === null
//                         ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-transparent text-white shadow-lg'
//                         : 'bg-white/80 border-gray-100 hover:border-purple-200'
//                     }`}
//                   >
//                     <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">🌐</div>
//                     <p className={`text-sm font-bold ${activeCat === null ? 'text-white' : 'text-gray-800'}`}>All Topics</p>
//                     <p className={`text-xs mt-0.5 ${activeCat === null ? 'text-white/70' : 'text-gray-400'}`}>Everything</p>
//                   </div>

//                   {/* Dynamic category cards from API */}
//                   {categories.map(cat => {
//                     const meta = getCategoryMeta(cat.categoryTitle);
//                     const isActive = activeCat === cat.categoryId;
//                     return (
//                       <div
//                         key={cat.categoryId}
//                         onClick={() => { setActiveCat(cat.categoryId); document.getElementById('feed-section')?.scrollIntoView({ behavior: 'smooth' }); }}
//                         className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center ${
//                           isActive
//                             ? `${meta.bg} border-transparent shadow-md`
//                             : 'bg-white/80 border-gray-100 hover:border-purple-200'
//                         }`}
//                       >
//                         {/* Show categoryImage if provided, else emoji */}
//                         <div className="mb-2 flex justify-center group-hover:scale-110 transition-transform duration-300">
//                           {cat.categoryImage
//                             ? <img src={cat.categoryImage} alt={cat.categoryTitle}
//                                 className="w-10 h-10 rounded-full object-cover shadow"
//                                 onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
//                               />
//                             : null
//                           }
//                           <span className={`text-3xl ${cat.categoryImage ? 'hidden' : ''}`}>{meta.emoji}</span>
//                         </div>
//                         <p className={`text-sm font-bold ${isActive ? meta.text : 'text-gray-800'}`}>
//                           {cat.categoryTitle}
//                         </p>
//                         <p className={`text-xs mt-0.5 ${isActive ? meta.text : 'text-gray-400'} line-clamp-1`}>
//                           {cat.categoryTagLine || 'Explore discussions'}
//                         </p>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>

//             {/* ═══ FEED HEADING ════════════════════════════════════════════════ */}
//             <div id="feed-section" className="flex items-center gap-3 pt-2">
//               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
//               <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
//                 {activeCat
//                   ? `${getCategoryMeta(categories.find(c => c.categoryId === activeCat)?.categoryTitle)?.emoji || ''} ${categories.find(c => c.categoryId === activeCat)?.categoryTitle || ''} Posts`
//                   : '🌐 All Posts'
//                 }
//               </span>
//               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
//             </div>

//             {/* Post Composer */}
//             <div id="composer">
//               <PostComposer user={user} categories={categories} onPostCreated={handlePostCreated} />
//             </div>

//             {/* Category Filter Tabs (horizontal scroll) */}
//             <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
//               <button
//                 onClick={() => setActiveCat(null)}
//                 className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
//                   activeCat === null
//                     ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
//                     : 'bg-white/60 text-gray-600 border border-white/60 hover:bg-white/80'
//                 }`}
//               >
//                 🌐 All
//               </button>
//               {categories.map(cat => {
//                 const meta = getCategoryMeta(cat.categoryTitle);
//                 return (
//                   <button
//                     key={cat.categoryId}
//                     onClick={() => setActiveCat(cat.categoryId)}
//                     className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
//                       activeCat === cat.categoryId
//                         ? `${meta.bg} ${meta.text} shadow-md border ${meta.border}`
//                         : 'bg-white/60 text-gray-600 border border-white/60 hover:bg-white/80'
//                     }`}
//                   >
//                     {meta.emoji} {cat.categoryTitle}
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Search status */}
//             {searchQuery && (
//               <div className="flex items-center justify-between bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-2.5">
//                 <p className="text-sm text-gray-600">
//                   {searchLoading
//                     ? <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Searching…</span>
//                     : <>Showing results for <strong className="text-purple-700">"{searchQuery}"</strong> — {searchResults?.length ?? 0} found</>
//                   }
//                 </p>
//                 <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
//                   ✕ Clear
//                 </button>
//               </div>
//             )}

//             {/* Feed */}
//             {feedLoading || searchLoading
//               ? Array(4).fill(0).map((_, i) => <PostSkeleton key={i} />)
//               : displayedPosts.length === 0
//                 ? <EmptyFeed onExplore={() => { setActiveCat(null); setSearchQuery(''); }} />
//                 : displayedPosts.map(post => (
//                     <PostCard key={post.postId} post={post} user={user} />
//                   ))
//             }
//           </main>

//           {/* ─── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
//           <aside className="hidden lg:block flex-shrink-0 w-72 sticky top-24 self-start space-y-4">

//             {/* Trending Categories */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-5">
//               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 🔥 <span>Trending Topics</span>
//               </h3>
//               {catLoading
//                 ? Array(4).fill(0).map((_, i) => (
//                     <div key={i} className="h-12 mb-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl animate-pulse" />
//                   ))
//                 : categories.slice(0, 6).map((cat, idx) => {
//                     const meta = getCategoryMeta(cat.categoryTitle);
//                     return (
//                       <button
//                         key={cat.categoryId}
//                         onClick={() => setActiveCat(cat.categoryId)}
//                         className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 group hover:shadow-md transition-all duration-200 ${
//                           activeCat === cat.categoryId
//                             ? `${meta.bg} ${meta.text} shadow-sm`
//                             : 'hover:bg-white/60'
//                         }`}
//                       >
//                         <span className="text-2xl">{meta.emoji}</span>
//                         <div className="flex-1 text-left">
//                           <p className={`text-sm font-semibold ${activeCat === cat.categoryId ? meta.text : 'text-gray-700'} group-hover:text-purple-700 transition-colors`}>
//                             {cat.categoryTitle}
//                           </p>
//                           <p className="text-xs text-gray-400">{cat.categoryTagLine || 'Explore discussions'}</p>
//                         </div>
//                         <span className={`text-xs font-bold ${meta.text} ${meta.bg} px-2 py-0.5 rounded-full`}>
//                           #{idx + 1}
//                         </span>
//                       </button>
//                     );
//                   })
//               }
//             </div>

//             {/* Platform stats */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-5">
//               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 📊 <span>Community Stats</span>
//               </h3>
//               <div className="space-y-3">
//                 {[
//                   { icon: '💡', label: 'Questions Asked', value: '10,000+' },
//                   { icon: '⚡', label: 'Answers Given',   value: '45,000+' },
//                   { icon: '👥', label: 'Active Members',  value: '5,000+' },
//                   { icon: '📂', label: 'Categories',      value: `${categories.length}` },
//                 ].map(stat => (
//                   <div key={stat.label} className="flex items-center gap-3 py-2 border-b border-white/40 last:border-none">
//                     <span className="text-xl">{stat.icon}</span>
//                     <div className="flex-1">
//                       <p className="text-xs text-gray-500">{stat.label}</p>
//                     </div>
//                     <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                       {stat.value}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Tips for new users */}
//             <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-5 text-white">
//               <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3">💡 Pro Tip</span>
//               <h3 className="font-bold text-base mb-2">Get better answers faster</h3>
//               <p className="text-white/80 text-xs leading-relaxed mb-4">
//                 Add a clear title, detailed context, and choose the right category. Well-framed questions get 3× more responses!
//               </p>
//               <button
//                 onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })}
//                 className="w-full py-2 rounded-xl bg-white text-purple-700 text-sm font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
//               >
//                 ✍️ Share Your Thoughts
//               </button>
//             </div>

//             {/* Footer links */}
//             <div className="px-2">
//               <p className="text-xs text-gray-400 leading-relaxed">
//                 <a href="/about" className="hover:text-purple-600 transition-colors">About</a>
//                 {' · '}
//                 <a href="/privacy" className="hover:text-purple-600 transition-colors">Privacy</a>
//                 {' · '}
//                 <a href="/terms" className="hover:text-purple-600 transition-colors">Terms</a>
//                 {' · '}
//                 <a href="/help" className="hover:text-purple-600 transition-colors">Help</a>
//               </p>
//               <p className="text-xs text-gray-300 mt-1">© 2026 InfoCircle</p>
//             </div>
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomePage;













// V-F-1.01









// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate, useSearchParams, Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api';
// import DarkModeToggle from '../../components/common/DarkModeToggle';

// // ─── Category meta: emoji + colour per category title ─────────────────────────
// const CATEGORY_META = {
//   Technology:  { emoji: '💻', color: 'blue',   bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200'   },
//   Healthcare:  { emoji: '🏥', color: 'green',  bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200'  },
//   Geopolitics: { emoji: '🌍', color: 'purple', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
//   Education:   { emoji: '📚', color: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
//   Business:    { emoji: '💼', color: 'pink',   bg: 'bg-pink-100',   text: 'text-pink-700',   border: 'border-pink-200'   },
//   Science:     { emoji: '🔬', color: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
// };
// const getCategoryMeta = (title) =>
//   CATEGORY_META[title] || { emoji: '📌', color: 'gray', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };

// // ─── Relative time helper ──────────────────────────────────────────────────────
// const timeAgo = (dateStr) => {
//   if (!dateStr) return '';
//   const diff = (Date.now() - new Date(dateStr)) / 1000;
//   if (diff < 60)   return 'just now';
//   if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
//   if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
//   return `${Math.floor(diff / 86400)}d ago`;
// };

// // ─── User avatar initials ──────────────────────────────────────────────────────
// const getInitials = (name = '') =>
//   name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

// const AVATAR_GRADIENTS = [
//   'from-blue-500 to-purple-600',
//   'from-purple-500 to-pink-600',
//   'from-green-500 to-teal-600',
//   'from-orange-500 to-red-600',
//   'from-indigo-500 to-blue-600',
// ];
// const avatarGradient = (id) => AVATAR_GRADIENTS[(id || 0) % AVATAR_GRADIENTS.length];

// // ─── Skeleton Loader ───────────────────────────────────────────────────────────
// const PostSkeleton = () => (
//   <div className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl shadow-lg p-6 animate-pulse">
//     <div className="flex items-start gap-4 mb-4">
//       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex-shrink-0" />
//       <div className="flex-1 space-y-2 pt-1">
//         <div className="h-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-40" />
//         <div className="h-3 bg-gray-100 rounded-full w-24" />
//       </div>
//       <div className="h-6 w-20 bg-blue-50 rounded-full" />
//     </div>
//     <div className="space-y-2 mb-4">
//       <div className="h-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full w-4/5" />
//       <div className="h-4 bg-gray-100 rounded-full w-full" />
//       <div className="h-4 bg-gray-100 rounded-full w-3/4" />
//     </div>
//     <div className="flex gap-4 pt-3 border-t border-gray-100">
//       <div className="h-8 w-24 bg-gray-100 rounded-full" />
//       <div className="h-8 w-24 bg-gray-100 rounded-full" />
//       <div className="h-8 w-20 bg-gray-100 rounded-full ml-auto" />
//     </div>
//   </div>
// );

// // ─── Post Composer ─────────────────────────────────────────────────────────────
// const PostComposer = ({ user, categories, onPostCreated }) => {
//   const [title, setTitle]       = useState('');
//   const [content, setContent]   = useState('');
//   const [catId, setCatId]       = useState('');
//   const [expanded, setExpanded] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError]       = useState('');
//   const [mediaFile, setMediaFile]     = useState(null);
//   const [mediaPreview, setMediaPreview] = useState(null);
//   const [mediaType, setMediaType]     = useState(null);
//   const composerFileRef = React.useRef(null);

//   const handleFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const isImage = file.type.startsWith('image/');
//     const isVideo = file.type.startsWith('video/');
//     if (!isImage && !isVideo) { setError('Only images or videos supported.'); return; }
//     if (file.size > (isVideo ? 50 : 10) * 1024 * 1024) { setError('File too large.'); return; }
//     if (mediaPreview) URL.revokeObjectURL(mediaPreview);
//     setError('');
//     setMediaFile(file);
//     setMediaType(isImage ? 'image' : 'video');
//     setMediaPreview(URL.createObjectURL(file));
//   };

//   const handleRemoveMedia = () => {
//     if (mediaPreview) URL.revokeObjectURL(mediaPreview);
//     setMediaFile(null); setMediaPreview(null); setMediaType(null);
//     if (composerFileRef.current) composerFileRef.current.value = '';
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!title.trim() || !content.trim() || !catId) {
//       setError('Please fill in all fields and select a category.');
//       return;
//     }
//     setError('');
//     setSubmitting(true);
//     try {
//       const res = await api.post(
//         `/post/user/${user.userId}/category/${catId}/savePost`,
//         { title: title.trim(), content: content.trim() }
//       );
//       let finalPost = res.data;
//       // Upload image if selected
//       if (mediaFile && mediaType === 'image') {
//         try {
//           const form = new FormData();
//           form.append('image', mediaFile);
//           const imgRes = await api.post(`/post/post/image/upload/${finalPost.postId}`, form, {
//             headers: { 'Content-Type': 'multipart/form-data' }
//           });
//           finalPost = imgRes.data;
//         } catch { /* image upload failed silently */ }
//       }
//       onPostCreated(finalPost);
//       setTitle(''); setContent(''); setCatId('');
//       setExpanded(false);
//       handleRemoveMedia();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to post. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-5 mb-6">
//       {/* Composer top row */}
//       <div className="flex items-center gap-4">
//         <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg`}>
//           {getInitials(user?.userName)}
//         </div>
//         <button
//           onClick={() => setExpanded(true)}
//           className="flex-1 text-left px-5 py-3 rounded-full bg-white/60 border border-white/60 text-gray-400 hover:border-purple-300 hover:bg-white/80 transition-all duration-200 text-sm"
//         >
//           ✍️ &nbsp; Ask a question or share knowledge…
//         </button>
//       </div>

//       {/* Expanded form */}
//       {expanded && (
//         <form onSubmit={handleSubmit} className="mt-5 space-y-4">
//           {error && (
//             <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-red-600 text-sm">
//               {error}
//             </div>
//           )}

//           <input
//             type="text"
//             value={title}
//             onChange={e => setTitle(e.target.value)}
//             placeholder="Title / Question headline…"
//             className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 text-sm transition-all"
//           />

//           <textarea
//             value={content}
//             onChange={e => setContent(e.target.value)}
//             placeholder="Share your knowledge, ask a detailed question, or start a discussion…"
//             rows={4}
//             className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 text-sm resize-none transition-all"
//           />

//           {/* Media preview */}
//           {mediaPreview && (
//             <div className="relative rounded-xl overflow-hidden border border-white/60">
//               {mediaType === 'image'
//                 ? <img src={mediaPreview} alt="Preview" className="w-full max-h-56 object-cover"/>
//                 : <video src={mediaPreview} controls className="w-full max-h-56"/>
//               }
//               <button type="button" onClick={handleRemoveMedia}
//                 className="absolute top-2 right-2 px-2 py-1 rounded-full bg-red-500/80 text-white text-xs font-semibold">
//                 ✕ Remove
//               </button>
//             </div>
//           )}

//           <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
//             <select
//               value={catId}
//               onChange={e => setCatId(e.target.value)}
//               className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 text-sm transition-all"
//             >
//               <option value="">📂 Select a category…</option>
//               {categories.map(c => {
//                 const meta = getCategoryMeta(c.categoryTitle);
//                 return (
//                   <option key={c.categoryId} value={c.categoryId}>
//                     {meta.emoji} {c.categoryTitle}
//                   </option>
//                 );
//               })}
//             </select>

//             <div className="flex gap-2 self-end sm:self-auto items-center">
//               {/* Media attach button */}
//               <button type="button" onClick={() => composerFileRef.current?.click()}
//                 title="Add image or video"
//                 className="p-3 rounded-xl border border-gray-300 text-gray-500 text-sm hover:bg-gray-50 hover:text-purple-600 transition-all">
//                 📷
//               </button>
//               <input ref={composerFileRef} type="file" accept="image/*,video/*"
//                 onChange={handleFileChange} className="hidden"/>

//               <button
//                 type="button"
//                 onClick={() => { setExpanded(false); setError(''); handleRemoveMedia(); }}
//                 className="px-5 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
//               >
//                 {submitting ? (
//                   <span className="flex items-center gap-2">
//                     <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
//                     </svg>
//                     Posting…
//                   </span>
//                 ) : '🚀 Post'}
//               </button>
//             </div>
//           </div>
//         </form>
//       )}

//       {/* Quick action bar when collapsed */}
//       {!expanded && (
//         <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/40">
//           <button
//             onClick={() => setExpanded(true)}
//             className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
//           >
//             💡 Share Knowledge
//           </button>
//           <button
//             onClick={() => setExpanded(true)}
//             className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-pink-600 hover:bg-pink-50 transition-colors"
//           >
//             📝 Write Article
//           </button>
//           <button
//             onClick={() => setExpanded(true)}
//             className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors ml-auto"
//           >
//             📷 Add Media
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── Comment Section ───────────────────────────────────────────────────────────
// const CommentSection = ({ post, user }) => {
//   const [comments, setComments]   = useState(Array.from(post.comments || post.comment || []));
//   const [text, setText]           = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [open, setOpen]           = useState(false);

//   const handleAddComment = async (e) => {
//     e.preventDefault();
//     if (!text.trim()) return;
//     setSubmitting(true);
//     try {
//       const res = await api.post(`/comment/post/${post.postId}/saveComment`, {
//         content: text.trim(),
//         post: { postId: post.postId },
//       });
//       setComments(prev => [...prev, res.data]);
//       setText('');
//     } catch (err) {
//       // Show error to user instead of fake optimistic update
//       const errMsg = err?.response?.data?.message || 'Failed to save your thought. Please try again.';
//       alert(errMsg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="mt-4 pt-4 border-t border-white/40">
//       <button
//         onClick={() => setOpen(v => !v)}
//         className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors font-medium"
//       >
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
//         </svg>
//         💬 {comments.length} {comments.length === 1 ? "Thought" : "Thoughts"}
//         <svg className={`w-3 h-3 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
//         </svg>
//       </button>

//       {open && (
//         <div className="mt-3 space-y-3">
//           {/* Existing comments */}
//           {comments.length === 0 && (
//             <p className="text-sm text-gray-400 italic py-2">No answers yet. Be the first to respond!</p>
//           )}
//           {comments.map(c => (
//             <div key={c.commentId} className="flex gap-3 bg-white/40 rounded-xl p-3">
//               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
//                 {getInitials(user?.userName)}
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-700 mb-1">{user?.userName || 'User'} <span className="text-gray-400 font-normal">· {timeAgo(c.createdAt)}</span></p>
//                 <p className="text-sm text-gray-700">{c.content}</p>
//               </div>
//             </div>
//           ))}

//           {/* Add comment */}
//           <form onSubmit={handleAddComment} className="flex gap-2 mt-3">
//             <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
//               {getInitials(user?.userName)}
//             </div>
//             <input
//               type="text"
//               value={text}
//               onChange={e => setText(e.target.value)}
//               placeholder="Share your thoughts…"
//               className="flex-1 px-4 py-2 bg-white/60 border border-white/60 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm transition-all"
//             />
//             <button
//               type="submit"
//               disabled={submitting || !text.trim()}
//               className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100"
//             >
//               {submitting ? '…' : 'Post'}
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── Post Card ─────────────────────────────────────────────────────────────────
// const PostCard = ({ post, user }) => {
//   const [expanded, setExpanded] = useState(false);
//   const meta    = getCategoryMeta(post.category?.categoryTitle);
//   const author  = post.user;
//   const isLong  = post.content?.length > 280;

//   return (
//     <div className="group bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 p-6">
//       {/* Header */}
//       <div className="flex items-start justify-between gap-4 mb-4">
//         <div className="flex items-start gap-3">
//           <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient(author?.userId)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md`}>
//             {author?.profileImage
//               ? <img src={`/api/post/post/image/${author.profileImage}`} alt="" className="w-full h-full rounded-full object-cover"/>
//               : getInitials(author?.userName)
//             }
//           </div>
//           <div>
//             <p className="font-semibold text-gray-800 leading-tight">
//               {author?.userName || 'Anonymous'}
//             </p>
//             <div className="flex items-center gap-2 mt-0.5 flex-wrap">
//               <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
//               {post.category && (
//                 <>
//                   <span className="text-gray-300">·</span>
//                   <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.bg} ${meta.text}`}>
//                     {meta.emoji} {post.category.categoryTitle}
//                   </span>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Post image badge */}
//         {post.postImage && (
//           <span className="flex-shrink-0 px-2 py-1 rounded-full bg-blue-50 text-blue-500 text-xs font-medium">
//             📷 Image
//           </span>
//         )}
//       </div>

//       {/* Title */}
//       <h3 className="text-base font-bold text-gray-800 mb-2 leading-snug group-hover:text-purple-700 transition-colors cursor-pointer">
//         {post.title}
//       </h3>

//       {/* Content */}
//       <div className="text-sm text-gray-600 leading-relaxed mb-2">
//         {isLong && !expanded
//           ? <>{post.content.slice(0, 280)}<span className="text-gray-400">…</span></>
//           : post.content
//         }
//       </div>
//       {isLong && (
//         <button
//           onClick={() => setExpanded(v => !v)}
//           className="text-xs text-purple-600 font-medium hover:underline mb-3"
//         >
//           {expanded ? 'Show less' : 'Read more'}
//         </button>
//       )}

//       {/* Post Image */}
//       {post.postImage && (
//         <div className="mt-3 mb-3 rounded-xl overflow-hidden border border-white/60">
//           <img
//             src={`/api/post/post/image/${post.postImage}`}
//             alt="Post"
//             className="w-full max-h-80 object-cover"
//             onError={e => e.target.style.display = 'none'}
//           />
//         </div>
//       )}

//       {/* Comments */}
//       <CommentSection post={post} user={user} />
//     </div>
//   );
// };

// // ─── Empty State ───────────────────────────────────────────────────────────────
// const EmptyFeed = ({ onExplore }) => (
//   <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-16 text-center">
//     <div className="text-7xl mb-6">🌱</div>
//     <h3 className="text-2xl font-bold text-gray-800 mb-3">
//       No posts yet in this category
//     </h3>
//     <p className="text-gray-500 mb-8 max-w-sm mx-auto">
//       Be the first to ask a question or share your knowledge with the community!
//     </p>
//     <div className="flex gap-3 justify-center flex-wrap">
//       <button
//         onClick={onExplore}
//         className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
//       >
//         Explore All Posts
//       </button>
//     </div>
//   </div>
// );

// // ─── Main HomePage ─────────────────────────────────────────────────────────────
// const HomePage = () => {
//   const { user, logout } = useAuth();
//   const navigate         = useNavigate();
//   const [searchParams]   = useSearchParams();

//   // Feed state
//   const [posts, setPosts]         = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [activeCat, setActiveCat]   = useState(null); // null = All
//   const [feedLoading, setFeedLoading] = useState(true);
//   const [catLoading, setCatLoading]   = useState(true);

//   // Sidebar / UI state
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [searchQuery, setSearchQuery]   = useState(searchParams.get('search') || '');
//   const [searchResults, setSearchResults] = useState(null);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [sidebarOpen, setSidebarOpen]     = useState(false);

//   const dropdownRef = useRef(null);

//   // ── Load categories ────────────────────────────────────────────────────────
//   useEffect(() => {
//     api.get('/category/allCategories')
//       .then(res => setCategories(res.data || []))
//       .catch(() => setCategories([]))
//       .finally(() => setCatLoading(false));
//   }, []);

//   // ── Load posts (all or by category) ───────────────────────────────────────
//   useEffect(() => {
//     setFeedLoading(true);
//     const endpoint = activeCat
//       ? `/post/category/${activeCat}/posts`
//       : '/post/allPosts';

//     api.get(endpoint)
//       .then(res => {
//         const data = res.data;
//         // allPosts returns PostResponse with content array; category returns array directly
//         setPosts(Array.isArray(data) ? data : (data.content || []));
//       })
//       .catch(() => setPosts([]))
//       .finally(() => setFeedLoading(false));
//   }, [activeCat]);

//   // ── Search ─────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!searchQuery.trim()) { setSearchResults(null); return; }
//     const debounce = setTimeout(() => {
//       setSearchLoading(true);
//       api.get(`/post/search/${encodeURIComponent(searchQuery.trim())}/posts`)
//         .then(res => setSearchResults(Array.isArray(res.data) ? res.data : []))
//         .catch(() => setSearchResults([]))
//         .finally(() => setSearchLoading(false));
//     }, 400);
//     return () => clearTimeout(debounce);
//   }, [searchQuery]);

//   // ── Close dropdown on outside click ───────────────────────────────────────
//   useEffect(() => {
//     const handler = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const handleLogout = () => { logout(); navigate('/login'); };

//   const handlePostCreated = (newPost) => {
//     setPosts(prev => [newPost, ...prev]);
//   };

//   const displayedPosts = searchResults !== null ? searchResults : posts;

//   // ── Stats derived ──────────────────────────────────────────────────────────
//   const userPostCount = posts.filter(p => p.user?.userId === user?.userId).length;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

//       {/* ═══════════════════ STICKY HEADER ══════════════════════════════════ */}
//       <div className="fixed top-0 left-0 right-0 flex justify-center pt-5 z-50">
//         <nav className="flex items-center justify-between gap-4 w-[92%] max-w-7xl px-6 py-3 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl">

//           {/* Logo */}
//           <a href="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 flex-shrink-0">
//             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
//               <span className="text-white font-black text-sm">IC</span>
//             </div>
//             <span className="hidden lg:block text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//               InfoCircle
//             </span>
//           </a>

//           {/* Search */}
//           <div className="flex-1 max-w-md mx-2">
//             <div className="relative">
//               <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
//               </svg>
//               <input
//                 type="text"
//                 placeholder="Search questions, topics…"
//                 value={searchQuery}
//                 onChange={e => setSearchQuery(e.target.value)}
//                 onKeyDown={e => { if (e.key === 'Escape') setSearchQuery(''); }}
//                 className="w-full pl-9 pr-8 py-2 rounded-full border border-gray-200 bg-white/80 text-gray-700 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
//               />
//               {searchQuery && (
//                 <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//                   </svg>
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Right nav */}
//           <div className="flex items-center gap-2">
//             {/* Dark mode toggle */}
//             <DarkModeToggle />

//             {/* Ask Question CTA */}
//             <button
//               onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })}
//               className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
//             >
//               ✍️ <span>Ask</span>
//             </button>

//             {/* Mobile menu toggle */}
//             <button
//               onClick={() => setSidebarOpen(v => !v)}
//               className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
//             >
//               <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
//               </svg>
//             </button>

//             {/* User dropdown */}
//             <div className="relative" ref={dropdownRef}>
//               <button
//                 onClick={() => setShowDropdown(v => !v)}
//                 className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors"
//               >
//                 <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-sm`}>
//                   {getInitials(user?.userName)}
//                 </div>
//                 <span className="hidden lg:block text-gray-700 font-medium text-sm max-w-[100px] truncate">
//                   {user?.userName}
//                 </span>
//                 <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
//                 </svg>
//               </button>

//               {showDropdown && (
//                 <div className="absolute right-0 mt-2 w-52 py-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
//                   <div className="px-4 py-2 mb-1 border-b border-gray-100">
//                     <p className="text-sm font-semibold text-gray-800 truncate">{user?.userName}</p>
//                     <p className="text-xs text-gray-400 truncate">{user?.bio || user?.city || 'InfoCircle Member'}</p>
//                   </div>
//                   <a href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 transition-colors text-sm">
//                     <span>👤</span> My Profile
//                   </a>
//                   <a href="/my-posts" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 transition-colors text-sm">
//                     <span>📝</span> My Posts ({userPostCount})
//                   </a>
//                   <a href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 transition-colors text-sm">
//                     <span>⚙️</span> Settings
//                   </a>
//                   <hr className="my-1 border-gray-100"/>
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm"
//                   >
//                     <span>🚪</span> Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </nav>
//       </div>

//       {/* ═══════════════════ MAIN LAYOUT ════════════════════════════════════ */}
//       <div className="flex justify-center px-4 pt-28 pb-12">
//         <div className="w-full max-w-7xl flex gap-6">

//           {/* ─── LEFT SIDEBAR ──────────────────────────────────────────────── */}
//           <aside className={`
//             flex-shrink-0 w-64 space-y-4
//             ${sidebarOpen ? 'fixed inset-0 z-40 bg-white/80 backdrop-blur-xl p-6 pt-24 overflow-y-auto' : 'hidden md:block sticky top-24 self-start'}
//           `}>
//             {sidebarOpen && (
//               <button onClick={() => setSidebarOpen(false)} className="absolute top-20 right-4 p-2 rounded-full hover:bg-gray-100">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//                 </svg>
//               </button>
//             )}

//             {/* User Profile Card */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg overflow-hidden">
//               {/* Banner */}
//               <div className="h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500" />
//               {/* Avatar */}
//               <div className="px-5 pb-5">
//                 <div className={`-mt-7 w-14 h-14 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white`}>
//                   {getInitials(user?.userName)}
//                 </div>
//                 <h3 className="mt-2 font-bold text-gray-800">{user?.userName}</h3>
//                 {user?.bio && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{user.bio}</p>}
//                 {user?.city && (
//                   <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
//                     <span>📍</span>{user.city}
//                   </p>
//                 )}

//                 {/* Stats row */}
//                 <div className="mt-3 grid grid-cols-2 gap-2">
//                   <div className="bg-blue-50/80 rounded-xl p-2 text-center">
//                     <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{userPostCount}</p>
//                     <p className="text-xs text-gray-500">My Posts</p>
//                   </div>
//                   <div className="bg-purple-50/80 rounded-xl p-2 text-center">
//                     <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{categories.length}</p>
//                     <p className="text-xs text-gray-500">Categories</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Navigation */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-4">
//               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Navigation</p>
//               {[
//                 { icon: '🏠', label: 'Home Feed', href: '/home', active: true },
//                 { icon: '✍️', label: 'Create Post', href: '/create-post' },
//                 { icon: '👤', label: 'My Profile', href: '/profile' },
//                 { icon: '📝', label: 'My Posts', href: '/my-posts' },
//                 { icon: '🔔', label: 'Notifications', href: '/home' },
//                 { icon: '⚙️', label: 'Settings', href: '/settings' },
//               ].map(item => (
//                 <a
//                   key={item.label}
//                   href={item.href}
//                   onClick={item.scroll ? (e) => {
//                     e.preventDefault();
//                     document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' });
//                     setSidebarOpen(false);
//                   } : undefined}
//                   className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
//                     item.active
//                       ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 border border-purple-100'
//                       : 'text-gray-600 hover:bg-white/60 hover:text-purple-600'
//                   }`}
//                 >
//                   <span>{item.icon}</span>
//                   {item.label}
//                   {item.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-600" />}
//                 </a>
//               ))}
//             </div>

//             {/* Categories Sidebar */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-4">
//               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Categories</p>
//               <button
//                 onClick={() => { setActiveCat(null); setSidebarOpen(false); }}
//                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
//                   activeCat === null
//                     ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
//                     : 'text-gray-600 hover:bg-white/60'
//                 }`}
//               >
//                 🌐 All Topics
//               </button>
//               {catLoading
//                 ? Array(5).fill(0).map((_, i) => (
//                     <div key={i} className="h-9 mb-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl animate-pulse" />
//                   ))
//                 : categories.map(cat => {
//                     const meta = getCategoryMeta(cat.categoryTitle);
//                     return (
//                       <button
//                         key={cat.categoryId}
//                         onClick={() => { setActiveCat(cat.categoryId); setSidebarOpen(false); }}
//                         className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
//                           activeCat === cat.categoryId
//                             ? `${meta.bg} ${meta.text} shadow-sm`
//                             : 'text-gray-600 hover:bg-white/60'
//                         }`}
//                       >
//                         <span>{meta.emoji}</span>
//                         <span className="truncate">{cat.categoryTitle}</span>
//                       </button>
//                     );
//                   })
//               }
//             </div>
//           </aside>

//           {/* ─── CENTER FEED ───────────────────────────────────────────────── */}
//           <main className="flex-1 min-w-0 space-y-5">

//             {/* ═══ HERO SECTION — always visible at top of feed ═══════════ */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl overflow-hidden">
//               {/* Gradient banner strip */}
//               <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

//               <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-8 py-8">
//                 {/* Left — welcome copy */}
//                 <div className="flex-1 min-w-0">
//                   <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-blue-200 text-blue-600 text-xs font-semibold mb-4 shadow-md">
//                     ✨ Welcome back, {user?.userName}!
//                   </span>

//                   <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-3">
//                     Discover. Learn.
//                     <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//                       Share Knowledge.
//                     </span>
//                   </h1>

//                   <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-md">
//                     Explore thousands of questions across Technology, Healthcare, Education,
//                     and more. Share your expertise and learn from the community.
//                   </p>

//                   <div className="flex flex-wrap gap-3">
//                     <button
//                       onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })}
//                       className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
//                     >
//                       ✍️ Share Your Thoughts
//                     </button>
//                     <button
//                       onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
//                       className="px-6 py-2.5 rounded-full bg-white text-purple-600 text-sm font-semibold border-2 border-purple-200 shadow hover:border-purple-400 hover:shadow-lg hover:scale-105 transition-all duration-300"
//                     >
//                       📂 Browse Categories
//                     </button>
//                   </div>
//                 </div>

//                 {/* Right — floating stat cards */}
//                 <div className="relative flex-shrink-0 w-full md:w-64 h-44 hidden md:block">
//                   <div className="absolute top-0 left-0 animate-bounce" style={{ animationDuration: '3s' }}>
//                     <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-blue-200 shadow-xl text-center min-w-[130px]">
//                       <div className="text-3xl mb-1">💡</div>
//                       <p className="text-lg font-bold text-gray-800">10K+</p>
//                       <p className="text-xs text-gray-500">Questions Asked</p>
//                     </div>
//                   </div>
//                   <div className="absolute top-4 right-0 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
//                     <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-purple-200 shadow-xl text-center min-w-[130px]">
//                       <div className="text-3xl mb-1">⚡</div>
//                       <p className="text-lg font-bold text-gray-800">Fast</p>
//                       <p className="text-xs text-gray-500">Instant Answers</p>
//                     </div>
//                   </div>
//                   <div className="absolute bottom-0 left-8 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
//                     <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-pink-200 shadow-xl text-center min-w-[130px]">
//                       <div className="text-3xl mb-1">👥</div>
//                       <p className="text-lg font-bold text-gray-800">5K+</p>
//                       <p className="text-xs text-gray-500">Active Users</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* ═══ CATEGORIES BROWSE SECTION ══════════════════════════════════ */}
//             <div id="categories-section" className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-6">
//               <h2 className="text-xl font-extrabold mb-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//                 📂 Explore Popular Categories
//               </h2>

//               {catLoading ? (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                   {Array(6).fill(0).map((_, i) => (
//                     <div key={i} className="h-28 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl animate-pulse" />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                   {/* "All Topics" card */}
//                   <div
//                     onClick={() => { setActiveCat(null); document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' }); }}
//                     className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center ${
//                       activeCat === null
//                         ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-transparent text-white shadow-lg'
//                         : 'bg-white/80 border-gray-100 hover:border-purple-200'
//                     }`}
//                   >
//                     <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">🌐</div>
//                     <p className={`text-sm font-bold ${activeCat === null ? 'text-white' : 'text-gray-800'}`}>All Topics</p>
//                     <p className={`text-xs mt-0.5 ${activeCat === null ? 'text-white/70' : 'text-gray-400'}`}>Everything</p>
//                   </div>

//                   {/* Dynamic category cards from API */}
//                   {categories.map(cat => {
//                     const meta = getCategoryMeta(cat.categoryTitle);
//                     const isActive = activeCat === cat.categoryId;
//                     return (
//                       <div
//                         key={cat.categoryId}
//                         onClick={() => { setActiveCat(cat.categoryId); document.getElementById('feed-section')?.scrollIntoView({ behavior: 'smooth' }); }}
//                         className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center ${
//                           isActive
//                             ? `${meta.bg} border-transparent shadow-md`
//                             : 'bg-white/80 border-gray-100 hover:border-purple-200'
//                         }`}
//                       >
//                         {/* Show categoryImage if provided, else emoji */}
//                         <div className="mb-2 flex justify-center group-hover:scale-110 transition-transform duration-300">
//                           {cat.categoryImage
//                             ? <img src={cat.categoryImage} alt={cat.categoryTitle}
//                                 className="w-10 h-10 rounded-full object-cover shadow"
//                                 onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
//                               />
//                             : null
//                           }
//                           <span className={`text-3xl ${cat.categoryImage ? 'hidden' : ''}`}>{meta.emoji}</span>
//                         </div>
//                         <p className={`text-sm font-bold ${isActive ? meta.text : 'text-gray-800'}`}>
//                           {cat.categoryTitle}
//                         </p>
//                         <p className={`text-xs mt-0.5 ${isActive ? meta.text : 'text-gray-400'} line-clamp-1`}>
//                           {cat.categoryTagLine || 'Explore discussions'}
//                         </p>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>

//             {/* ═══ FEED HEADING ════════════════════════════════════════════════ */}
//             <div id="feed-section" className="flex items-center gap-3 pt-2">
//               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
//               <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
//                 {activeCat
//                   ? `${getCategoryMeta(categories.find(c => c.categoryId === activeCat)?.categoryTitle)?.emoji || ''} ${categories.find(c => c.categoryId === activeCat)?.categoryTitle || ''} Posts`
//                   : '🌐 All Posts'
//                 }
//               </span>
//               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
//             </div>

//             {/* Post Composer */}
//             <div id="composer">
//               <PostComposer user={user} categories={categories} onPostCreated={handlePostCreated} />
//             </div>

//             {/* Category Filter Tabs (horizontal scroll) */}
//             <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
//               <button
//                 onClick={() => setActiveCat(null)}
//                 className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
//                   activeCat === null
//                     ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
//                     : 'bg-white/60 text-gray-600 border border-white/60 hover:bg-white/80'
//                 }`}
//               >
//                 🌐 All
//               </button>
//               {categories.map(cat => {
//                 const meta = getCategoryMeta(cat.categoryTitle);
//                 return (
//                   <button
//                     key={cat.categoryId}
//                     onClick={() => setActiveCat(cat.categoryId)}
//                     className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
//                       activeCat === cat.categoryId
//                         ? `${meta.bg} ${meta.text} shadow-md border ${meta.border}`
//                         : 'bg-white/60 text-gray-600 border border-white/60 hover:bg-white/80'
//                     }`}
//                   >
//                     {meta.emoji} {cat.categoryTitle}
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Search status */}
//             {searchQuery && (
//               <div className="flex items-center justify-between bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-2.5">
//                 <p className="text-sm text-gray-600">
//                   {searchLoading
//                     ? <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Searching…</span>
//                     : <>Showing results for <strong className="text-purple-700">"{searchQuery}"</strong> — {searchResults?.length ?? 0} found</>
//                   }
//                 </p>
//                 <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
//                   ✕ Clear
//                 </button>
//               </div>
//             )}

//             {/* Feed */}
//             {feedLoading || searchLoading
//               ? Array(4).fill(0).map((_, i) => <PostSkeleton key={i} />)
//               : displayedPosts.length === 0
//                 ? <EmptyFeed onExplore={() => { setActiveCat(null); setSearchQuery(''); }} />
//                 : displayedPosts.map(post => (
//                     <PostCard key={post.postId} post={post} user={user} />
//                   ))
//             }
//           </main>

//           {/* ─── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
//           <aside className="hidden lg:block flex-shrink-0 w-72 sticky top-24 self-start space-y-4">

//             {/* Trending Categories */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-5">
//               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 🔥 <span>Trending Topics</span>
//               </h3>
//               {catLoading
//                 ? Array(4).fill(0).map((_, i) => (
//                     <div key={i} className="h-12 mb-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl animate-pulse" />
//                   ))
//                 : categories.slice(0, 6).map((cat, idx) => {
//                     const meta = getCategoryMeta(cat.categoryTitle);
//                     return (
//                       <button
//                         key={cat.categoryId}
//                         onClick={() => setActiveCat(cat.categoryId)}
//                         className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 group hover:shadow-md transition-all duration-200 ${
//                           activeCat === cat.categoryId
//                             ? `${meta.bg} ${meta.text} shadow-sm`
//                             : 'hover:bg-white/60'
//                         }`}
//                       >
//                         <span className="text-2xl">{meta.emoji}</span>
//                         <div className="flex-1 text-left">
//                           <p className={`text-sm font-semibold ${activeCat === cat.categoryId ? meta.text : 'text-gray-700'} group-hover:text-purple-700 transition-colors`}>
//                             {cat.categoryTitle}
//                           </p>
//                           <p className="text-xs text-gray-400">{cat.categoryTagLine || 'Explore discussions'}</p>
//                         </div>
//                         <span className={`text-xs font-bold ${meta.text} ${meta.bg} px-2 py-0.5 rounded-full`}>
//                           #{idx + 1}
//                         </span>
//                       </button>
//                     );
//                   })
//               }
//             </div>

//             {/* Platform stats */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-5">
//               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 📊 <span>Community Stats</span>
//               </h3>
//               <div className="space-y-3">
//                 {[
//                   { icon: '💡', label: 'Questions Asked', value: '10,000+' },
//                   { icon: '⚡', label: 'Answers Given',   value: '45,000+' },
//                   { icon: '👥', label: 'Active Members',  value: '5,000+' },
//                   { icon: '📂', label: 'Categories',      value: `${categories.length}` },
//                 ].map(stat => (
//                   <div key={stat.label} className="flex items-center gap-3 py-2 border-b border-white/40 last:border-none">
//                     <span className="text-xl">{stat.icon}</span>
//                     <div className="flex-1">
//                       <p className="text-xs text-gray-500">{stat.label}</p>
//                     </div>
//                     <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                       {stat.value}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Tips for new users */}
//             <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-5 text-white">
//               <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3">💡 Pro Tip</span>
//               <h3 className="font-bold text-base mb-2">Get better answers faster</h3>
//               <p className="text-white/80 text-xs leading-relaxed mb-4">
//                 Add a clear title, detailed context, and choose the right category. Well-framed questions get 3× more responses!
//               </p>
//               <button
//                 onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })}
//                 className="w-full py-2 rounded-xl bg-white text-purple-700 text-sm font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
//               >
//                 ✍️ Share Your Thoughts
//               </button>
//             </div>

//             {/* Footer links */}
//             <div className="px-2">
//               <p className="text-xs text-gray-400 leading-relaxed">
//                 <a href="/about" className="hover:text-purple-600 transition-colors">About</a>
//                 {' · '}
//                 <a href="/privacy" className="hover:text-purple-600 transition-colors">Privacy</a>
//                 {' · '}
//                 <a href="/terms" className="hover:text-purple-600 transition-colors">Terms</a>
//                 {' · '}
//                 <a href="/help" className="hover:text-purple-600 transition-colors">Help</a>
//               </p>
//               <p className="text-xs text-gray-300 mt-1">© 2026 InfoCircle</p>
//             </div>
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomePage;












// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate, useSearchParams, Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api';
// import DarkModeToggle from '../../components/common/DarkModeToggle';

// // ─── Category meta: emoji + colour per category title ─────────────────────────
// const CATEGORY_META = {
//   Technology:  { emoji: '💻', color: 'blue',   bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200'   },
//   Healthcare:  { emoji: '🏥', color: 'green',  bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200'  },
//   Geopolitics: { emoji: '🌍', color: 'purple', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
//   Education:   { emoji: '📚', color: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
//   Business:    { emoji: '💼', color: 'pink',   bg: 'bg-pink-100',   text: 'text-pink-700',   border: 'border-pink-200'   },
//   Science:     { emoji: '🔬', color: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
// };
// const getCategoryMeta = (title) =>
//   CATEGORY_META[title] || { emoji: '📌', color: 'gray', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };

// // ─── Relative time helper ──────────────────────────────────────────────────────
// const timeAgo = (dateStr) => {
//   if (!dateStr) return '';
//   const diff = (Date.now() - new Date(dateStr)) / 1000;
//   if (diff < 60)   return 'just now';
//   if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
//   if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
//   return `${Math.floor(diff / 86400)}d ago`;
// };

// // ─── User avatar initials ──────────────────────────────────────────────────────
// const getInitials = (name = '') =>
//   name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

// const AVATAR_GRADIENTS = [
//   'from-blue-500 to-purple-600',
//   'from-purple-500 to-pink-600',
//   'from-green-500 to-teal-600',
//   'from-orange-500 to-red-600',
//   'from-indigo-500 to-blue-600',
// ];
// const avatarGradient = (id) => AVATAR_GRADIENTS[(id || 0) % AVATAR_GRADIENTS.length];

// // ─── Skeleton Loader ───────────────────────────────────────────────────────────
// const PostSkeleton = () => (
//   <div className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl shadow-lg p-6 animate-pulse">
//     <div className="flex items-start gap-4 mb-4">
//       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex-shrink-0" />
//       <div className="flex-1 space-y-2 pt-1">
//         <div className="h-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-40" />
//         <div className="h-3 bg-gray-100 rounded-full w-24" />
//       </div>
//       <div className="h-6 w-20 bg-blue-50 rounded-full" />
//     </div>
//     <div className="space-y-2 mb-4">
//       <div className="h-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full w-4/5" />
//       <div className="h-4 bg-gray-100 rounded-full w-full" />
//       <div className="h-4 bg-gray-100 rounded-full w-3/4" />
//     </div>
//     <div className="flex gap-4 pt-3 border-t border-gray-100">
//       <div className="h-8 w-24 bg-gray-100 rounded-full" />
//       <div className="h-8 w-24 bg-gray-100 rounded-full" />
//       <div className="h-8 w-20 bg-gray-100 rounded-full ml-auto" />
//     </div>
//   </div>
// );

// // ─── Post Composer ─────────────────────────────────────────────────────────────
// const PostComposer = ({ user, categories, onPostCreated }) => {
//   const [title, setTitle]       = useState('');
//   const [content, setContent]   = useState('');
//   const [catId, setCatId]       = useState('');
//   const [expanded, setExpanded] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError]       = useState('');
//   const [mediaFile, setMediaFile]     = useState(null);
//   const [mediaPreview, setMediaPreview] = useState(null);
//   const [mediaType, setMediaType]     = useState(null);
//   const composerFileRef = React.useRef(null);

//   const handleFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const isImage = file.type.startsWith('image/');
//     const isVideo = file.type.startsWith('video/');
//     if (!isImage && !isVideo) { setError('Only images or videos supported.'); return; }
//     if (file.size > (isVideo ? 50 : 10) * 1024 * 1024) { setError('File too large.'); return; }
//     if (mediaPreview) URL.revokeObjectURL(mediaPreview);
//     setError('');
//     setMediaFile(file);
//     setMediaType(isImage ? 'image' : 'video');
//     setMediaPreview(URL.createObjectURL(file));
//   };

//   const handleRemoveMedia = () => {
//     if (mediaPreview) URL.revokeObjectURL(mediaPreview);
//     setMediaFile(null); setMediaPreview(null); setMediaType(null);
//     if (composerFileRef.current) composerFileRef.current.value = '';
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!title.trim() || !content.trim() || !catId) {
//       setError('Please fill in all fields and select a category.');
//       return;
//     }
//     setError('');
//     setSubmitting(true);
//     try {
//       const res = await api.post(
//         `/post/user/${user.userId}/category/${catId}/savePost`,
//         { title: title.trim(), content: content.trim() }
//       );
//       let finalPost = res.data;
//       // Upload image if selected
//       if (mediaFile && mediaType === 'image') {
//         try {
//           const form = new FormData();
//           form.append('image', mediaFile);
//           const imgRes = await api.post(`/post/post/image/upload/${finalPost.postId}`, form, {
//             headers: { 'Content-Type': 'multipart/form-data' }
//           });
//           finalPost = imgRes.data;
//         } catch { /* image upload failed silently */ }
//       }
//       onPostCreated(finalPost);
//       setTitle(''); setContent(''); setCatId('');
//       setExpanded(false);
//       handleRemoveMedia();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to post. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-5 mb-6">
//       {/* Composer top row */}
//       <div className="flex items-center gap-4">
//         <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg`}>
//           {getInitials(user?.userName)}
//         </div>
//         <button
//           onClick={() => setExpanded(true)}
//           className="flex-1 text-left px-5 py-3 rounded-full bg-white/60 border border-white/60 text-gray-400 hover:border-purple-300 hover:bg-white/80 transition-all duration-200 text-sm"
//         >
//           ✍️ &nbsp; Ask a question or share knowledge…
//         </button>
//       </div>

//       {/* Expanded form */}
//       {expanded && (
//         <form onSubmit={handleSubmit} className="mt-5 space-y-4">
//           {error && (
//             <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-red-600 text-sm">
//               {error}
//             </div>
//           )}

//           <input
//             type="text"
//             value={title}
//             onChange={e => setTitle(e.target.value)}
//             placeholder="Title / Question headline…"
//             className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 text-sm transition-all"
//           />

//           <textarea
//             value={content}
//             onChange={e => setContent(e.target.value)}
//             placeholder="Share your knowledge, ask a detailed question, or start a discussion…"
//             rows={4}
//             className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 text-sm resize-none transition-all"
//           />

//           {/* Media preview */}
//           {mediaPreview && (
//             <div className="relative rounded-xl overflow-hidden border border-white/60">
//               {mediaType === 'image'
//                 ? <img src={mediaPreview} alt="Preview" className="w-full max-h-56 object-cover"/>
//                 : <video src={mediaPreview} controls className="w-full max-h-56"/>
//               }
//               <button type="button" onClick={handleRemoveMedia}
//                 className="absolute top-2 right-2 px-2 py-1 rounded-full bg-red-500/80 text-white text-xs font-semibold">
//                 ✕ Remove
//               </button>
//             </div>
//           )}

//           <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
//             <select
//               value={catId}
//               onChange={e => setCatId(e.target.value)}
//               className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 text-sm transition-all"
//             >
//               <option value="">📂 Select a category…</option>
//               {categories.map(c => {
//                 const meta = getCategoryMeta(c.categoryTitle);
//                 return (
//                   <option key={c.categoryId} value={c.categoryId}>
//                     {meta.emoji} {c.categoryTitle}
//                   </option>
//                 );
//               })}
//             </select>

//             <div className="flex gap-2 self-end sm:self-auto items-center">
//               {/* Media attach button */}
//               <button type="button" onClick={() => composerFileRef.current?.click()}
//                 title="Add image or video"
//                 className="p-3 rounded-xl border border-gray-300 text-gray-500 text-sm hover:bg-gray-50 hover:text-purple-600 transition-all">
//                 📷
//               </button>
//               <input ref={composerFileRef} type="file" accept="image/*,video/*"
//                 onChange={handleFileChange} className="hidden"/>

//               <button
//                 type="button"
//                 onClick={() => { setExpanded(false); setError(''); handleRemoveMedia(); }}
//                 className="px-5 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
//               >
//                 {submitting ? (
//                   <span className="flex items-center gap-2">
//                     <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
//                     </svg>
//                     Posting…
//                   </span>
//                 ) : '🚀 Post'}
//               </button>
//             </div>
//           </div>
//         </form>
//       )}

//       {/* Quick action bar when collapsed */}
//       {!expanded && (
//         <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/40">
//           <button
//             onClick={() => setExpanded(true)}
//             className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
//           >
//             💡 Share Knowledge
//           </button>
//           <button
//             onClick={() => setExpanded(true)}
//             className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-pink-600 hover:bg-pink-50 transition-colors"
//           >
//             📝 Write Article
//           </button>
//           <button
//             onClick={() => setExpanded(true)}
//             className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors ml-auto"
//           >
//             📷 Add Media
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── Comment Section ───────────────────────────────────────────────────────────
// const CommentSection = ({ post, user }) => {
//   const [comments, setComments]   = useState(Array.from(post.comments || post.comment || []));
//   const [text, setText]           = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [open, setOpen]           = useState(false);

//   const handleAddComment = async (e) => {
//     e.preventDefault();
//     if (!text.trim()) return;
//     setSubmitting(true);
//     try {
//       const res = await api.post(`/comment/post/${post.postId}/saveComment`, {
//         content: text.trim(),
//         post: { postId: post.postId },
//       });
//       setComments(prev => [...prev, res.data]);
//       setText('');
//     } catch (err) {
//       // Show error to user instead of fake optimistic update
//       const errMsg = err?.response?.data?.message || 'Failed to save your thought. Please try again.';
//       alert(errMsg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="mt-4 pt-4 border-t border-white/40">
//       <button
//         onClick={() => setOpen(v => !v)}
//         className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors font-medium"
//       >
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
//         </svg>
//         💬 {comments.length} {comments.length === 1 ? "Thought" : "Thoughts"}
//         <svg className={`w-3 h-3 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
//         </svg>
//       </button>

//       {open && (
//         <div className="mt-3 space-y-3">
//           {/* Existing comments */}
//           {comments.length === 0 && (
//             <p className="text-sm text-gray-400 italic py-2">No answers yet. Be the first to respond!</p>
//           )}
//           {comments.map(c => (
//             <div key={c.commentId} className="flex gap-3 bg-white/40 rounded-xl p-3">
//               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
//                 {getInitials(user?.userName)}
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-700 mb-1">{user?.userName || 'User'} <span className="text-gray-400 font-normal">· {timeAgo(c.createdAt)}</span></p>
//                 <p className="text-sm text-gray-700">{c.content}</p>
//               </div>
//             </div>
//           ))}

//           {/* Add comment */}
//           <form onSubmit={handleAddComment} className="flex gap-2 mt-3">
//             <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
//               {getInitials(user?.userName)}
//             </div>
//             <input
//               type="text"
//               value={text}
//               onChange={e => setText(e.target.value)}
//               placeholder="Share your thoughts…"
//               className="flex-1 px-4 py-2 bg-white/60 border border-white/60 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm transition-all"
//             />
//             <button
//               type="submit"
//               disabled={submitting || !text.trim()}
//               className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100"
//             >
//               {submitting ? '…' : 'Post'}
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── Post Card ─────────────────────────────────────────────────────────────────
// const PostCard = ({ post, user }) => {
//   const [expanded, setExpanded] = useState(false);
//   const meta    = getCategoryMeta(post.category?.categoryTitle);
//   const author  = post.user;
//   const isLong  = post.content?.length > 280;

//   return (
//     <div className="group bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 p-6">
//       {/* Header */}
//       <div className="flex items-start justify-between gap-4 mb-4">
//         <div className="flex items-start gap-3">
//           <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient(author?.userId)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md`}>
//             {author?.profileImage
//               ? <img src={`/api/post/post/image/${author.profileImage}`} alt="" className="w-full h-full rounded-full object-cover"/>
//               : getInitials(author?.userName)
//             }
//           </div>
//           <div>
//             <p className="font-semibold text-gray-800 leading-tight">
//               {author?.userName || 'Anonymous'}
//             </p>
//             <div className="flex items-center gap-2 mt-0.5 flex-wrap">
//               <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
//               {post.category && (
//                 <>
//                   <span className="text-gray-300">·</span>
//                   <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.bg} ${meta.text}`}>
//                     {meta.emoji} {post.category.categoryTitle}
//                   </span>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Post image badge */}
//         {post.postImage && (
//           <span className="flex-shrink-0 px-2 py-1 rounded-full bg-blue-50 text-blue-500 text-xs font-medium">
//             📷 Image
//           </span>
//         )}
//       </div>

//       {/* Title */}
//       <h3 className="text-base font-bold text-gray-800 mb-2 leading-snug group-hover:text-purple-700 transition-colors cursor-pointer">
//         {post.title}
//       </h3>

//       {/* Content */}
//       <div className="text-sm text-gray-600 leading-relaxed mb-2">
//         {isLong && !expanded
//           ? <>{post.content.slice(0, 280)}<span className="text-gray-400">…</span></>
//           : post.content
//         }
//       </div>
//       {isLong && (
//         <button
//           onClick={() => setExpanded(v => !v)}
//           className="text-xs text-purple-600 font-medium hover:underline mb-3"
//         >
//           {expanded ? 'Show less' : 'Read more'}
//         </button>
//       )}

//       {/* Post Image */}
//       {post.postImage && (
//         <div className="mt-3 mb-3 rounded-xl overflow-hidden border border-white/60">
//           <img
//             src={`/api/post/post/image/${post.postImage}`}
//             alt="Post"
//             className="w-full max-h-80 object-cover"
//             onError={e => e.target.style.display = 'none'}
//           />
//         </div>
//       )}

//       {/* Comments */}
//       <CommentSection post={post} user={user} />
//     </div>
//   );
// };

// // ─── Empty State ───────────────────────────────────────────────────────────────
// const EmptyFeed = ({ onExplore }) => (
//   <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-16 text-center">
//     <div className="text-7xl mb-6">🌱</div>
//     <h3 className="text-2xl font-bold text-gray-800 mb-3">
//       No posts yet in this category
//     </h3>
//     <p className="text-gray-500 mb-8 max-w-sm mx-auto">
//       Be the first to ask a question or share your knowledge with the community!
//     </p>
//     <div className="flex gap-3 justify-center flex-wrap">
//       <button
//         onClick={onExplore}
//         className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
//       >
//         Explore All Posts
//       </button>
//     </div>
//   </div>
// );

// // ─── Main HomePage ─────────────────────────────────────────────────────────────
// const HomePage = () => {
//   const { user, logout } = useAuth();
//   const navigate         = useNavigate();
//   const [searchParams]   = useSearchParams();

//   // Feed state
//   const [posts, setPosts]         = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [activeCat, setActiveCat]   = useState(null); // null = All
//   const [feedLoading, setFeedLoading] = useState(true);
//   const [catLoading, setCatLoading]   = useState(true);

//   // Sidebar / UI state
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [searchQuery, setSearchQuery]   = useState(searchParams.get('search') || '');
//   const [searchResults, setSearchResults] = useState(null);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [sidebarOpen, setSidebarOpen]     = useState(false);

//   const dropdownRef = useRef(null);

//   // ── Load categories ────────────────────────────────────────────────────────
//   useEffect(() => {
//     api.get('/category/allCategories')
//       .then(res => setCategories(res.data || []))
//       .catch(() => setCategories([]))
//       .finally(() => setCatLoading(false));
//   }, []);

//   // ── Load posts (all or by category) ───────────────────────────────────────
//   useEffect(() => {
//     setFeedLoading(true);
//     const endpoint = activeCat
//       ? `/post/category/${activeCat}/posts`
//       : '/post/allPosts';

//     api.get(endpoint)
//       .then(res => {
//         const data = res.data;
//         // allPosts returns PostResponse with content array; category returns array directly
//         setPosts(Array.isArray(data) ? data : (data.content || []));
//       })
//       .catch(() => setPosts([]))
//       .finally(() => setFeedLoading(false));
//   }, [activeCat]);

//   // ── Search ─────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!searchQuery.trim()) { setSearchResults(null); return; }
//     const debounce = setTimeout(() => {
//       setSearchLoading(true);
//       api.get(`/post/search/${encodeURIComponent(searchQuery.trim())}/posts`)
//         .then(res => setSearchResults(Array.isArray(res.data) ? res.data : []))
//         .catch(() => setSearchResults([]))
//         .finally(() => setSearchLoading(false));
//     }, 400);
//     return () => clearTimeout(debounce);
//   }, [searchQuery]);

//   // ── Close dropdown on outside click ───────────────────────────────────────
//   useEffect(() => {
//     const handler = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const handleLogout = () => { logout(); navigate('/login'); };

//   const handlePostCreated = (newPost) => {
//     setPosts(prev => [newPost, ...prev]);
//   };

//   const displayedPosts = searchResults !== null ? searchResults : posts;

//   // ── Stats derived ──────────────────────────────────────────────────────────
//   const userPostCount = posts.filter(p => p.user?.userId === user?.userId).length;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

//       {/* ═══════════════════ STICKY HEADER ══════════════════════════════════ */}
//       <div className="fixed top-0 left-0 right-0 flex justify-center pt-5 z-50">
//         <nav className="flex items-center justify-between gap-4 w-[92%] max-w-7xl px-6 py-3 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl">

//           {/* Logo */}
//           <a href="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 flex-shrink-0">
//             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
//               <span className="text-white font-black text-sm">IC</span>
//             </div>
//             <span className="hidden lg:block text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//               InfoCircle
//             </span>
//           </a>

//           {/* Search */}
//           <div className="flex-1 max-w-md mx-2">
//             <div className="relative">
//               <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
//               </svg>
//               <input
//                 type="text"
//                 placeholder="Search questions, topics…"
//                 value={searchQuery}
//                 onChange={e => setSearchQuery(e.target.value)}
//                 onKeyDown={e => { if (e.key === 'Escape') setSearchQuery(''); }}
//                 className="w-full pl-9 pr-8 py-2 rounded-full border border-gray-200 bg-white/80 text-gray-700 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
//               />
//               {searchQuery && (
//                 <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//                   </svg>
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Right nav */}
//           <div className="flex items-center gap-2">
//             {/* Dark mode toggle */}
//             <DarkModeToggle />

//             {/* Ask Question CTA */}
//             <button
//               onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })}
//               className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
//             >
//               ✍️ <span>Ask</span>
//             </button>

//             {/* Mobile menu toggle */}
//             <button
//               onClick={() => setSidebarOpen(v => !v)}
//               className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
//             >
//               <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
//               </svg>
//             </button>

//             {/* User dropdown */}
//             <div className="relative" ref={dropdownRef}>
//               <button
//                 onClick={() => setShowDropdown(v => !v)}
//                 className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors"
//               >
//                 <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-sm`}>
//                   {getInitials(user?.userName)}
//                 </div>
//                 <span className="hidden lg:block text-gray-700 font-medium text-sm max-w-[100px] truncate">
//                   {user?.userName}
//                 </span>
//                 <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
//                 </svg>
//               </button>

//               {showDropdown && (
//                 <div className="absolute right-0 mt-2 w-52 py-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
//                   <div className="px-4 py-2 mb-1 border-b border-gray-100">
//                     <p className="text-sm font-semibold text-gray-800 truncate">{user?.userName}</p>
//                     <p className="text-xs text-gray-400 truncate">{user?.bio || user?.city || 'InfoCircle Member'}</p>
//                   </div>
//                   <a href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 transition-colors text-sm">
//                     <span>👤</span> My Profile
//                   </a>
//                   <a href="/my-posts" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 transition-colors text-sm">
//                     <span>📝</span> My Posts ({userPostCount})
//                   </a>
//                   <a href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 transition-colors text-sm">
//                     <span>⚙️</span> Settings
//                   </a>
//                   <hr className="my-1 border-gray-100"/>
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm"
//                   >
//                     <span>🚪</span> Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </nav>
//       </div>

//       {/* ═══════════════════ MAIN LAYOUT ════════════════════════════════════ */}
//       <div className="flex justify-center px-4 pt-28 pb-12">
//         <div className="w-full max-w-7xl flex gap-6">

//           {/* ─── LEFT SIDEBAR ──────────────────────────────────────────────── */}
//           <aside className={`
//             flex-shrink-0 w-64 space-y-4
//             ${sidebarOpen ? 'fixed inset-0 z-40 bg-white/80 backdrop-blur-xl p-6 pt-24 overflow-y-auto' : 'hidden md:block sticky top-24 self-start'}
//           `}>
//             {sidebarOpen && (
//               <button onClick={() => setSidebarOpen(false)} className="absolute top-20 right-4 p-2 rounded-full hover:bg-gray-100">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//                 </svg>
//               </button>
//             )}

//             {/* User Profile Card */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg overflow-hidden">
//               {/* Banner */}
//               <div className="h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500" />
//               {/* Avatar */}
//               <div className="px-5 pb-5">
//                 <div className={`-mt-7 w-14 h-14 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)} flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white`}>
//                   {getInitials(user?.userName)}
//                 </div>
//                 <h3 className="mt-2 font-bold text-gray-800">{user?.userName}</h3>
//                 {user?.bio && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{user.bio}</p>}
//                 {user?.city && (
//                   <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
//                     <span>📍</span>{user.city}
//                   </p>
//                 )}

//                 {/* Stats row */}
//                 <div className="mt-3 grid grid-cols-2 gap-2">
//                   <div className="bg-blue-50/80 rounded-xl p-2 text-center">
//                     <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{userPostCount}</p>
//                     <p className="text-xs text-gray-500">My Posts</p>
//                   </div>
//                   <div className="bg-purple-50/80 rounded-xl p-2 text-center">
//                     <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{categories.length}</p>
//                     <p className="text-xs text-gray-500">Categories</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Navigation */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-4">
//               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Navigation</p>
//               {[
//                 { icon: '🏠', label: 'Home Feed', href: '/home', active: true },
//                 { icon: '✍️', label: 'Create Post', href: '/create-post' },
//                 { icon: '👤', label: 'My Profile', href: '/profile' },
//                 { icon: '📝', label: 'My Posts', href: '/my-posts' },
//                 { icon: '🔔', label: 'Notifications', href: '/home' },
//                 { icon: '⚙️', label: 'Settings', href: '/settings' },
//               ].map(item => (
//                 <a
//                   key={item.label}
//                   href={item.href}
//                   onClick={item.scroll ? (e) => {
//                     e.preventDefault();
//                     document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' });
//                     setSidebarOpen(false);
//                   } : undefined}
//                   className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
//                     item.active
//                       ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 border border-purple-100'
//                       : 'text-gray-600 hover:bg-white/60 hover:text-purple-600'
//                   }`}
//                 >
//                   <span>{item.icon}</span>
//                   {item.label}
//                   {item.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-600" />}
//                 </a>
//               ))}
//             </div>

//             {/* Categories Sidebar */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-4">
//               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Categories</p>
//               <button
//                 onClick={() => { setActiveCat(null); setSidebarOpen(false); }}
//                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
//                   activeCat === null
//                     ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
//                     : 'text-gray-600 hover:bg-white/60'
//                 }`}
//               >
//                 🌐 All Topics
//               </button>
//               {catLoading
//                 ? Array(5).fill(0).map((_, i) => (
//                     <div key={i} className="h-9 mb-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl animate-pulse" />
//                   ))
//                 : categories.map(cat => {
//                     const meta = getCategoryMeta(cat.categoryTitle);
//                     return (
//                       <button
//                         key={cat.categoryId}
//                         onClick={() => { setActiveCat(cat.categoryId); setSidebarOpen(false); }}
//                         className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
//                           activeCat === cat.categoryId
//                             ? `${meta.bg} ${meta.text} shadow-sm`
//                             : 'text-gray-600 hover:bg-white/60'
//                         }`}
//                       >
//                         <span>{meta.emoji}</span>
//                         <span className="truncate">{cat.categoryTitle}</span>
//                       </button>
//                     );
//                   })
//               }
//             </div>
//           </aside>

//           {/* ─── CENTER FEED ───────────────────────────────────────────────── */}
//           <main className="flex-1 min-w-0 space-y-5">

//             {/* ═══ HERO SECTION — always visible at top of feed ═══════════ */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl overflow-hidden">
//               {/* Gradient banner strip */}
//               <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

//               <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-8 py-8">
//                 {/* Left — welcome copy */}
//                 <div className="flex-1 min-w-0">
//                   <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-blue-200 text-blue-600 text-xs font-semibold mb-4 shadow-md">
//                     ✨ Welcome back, {user?.userName}!
//                   </span>

//                   <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-3">
//                     Discover. Learn.
//                     <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//                       Share Knowledge.
//                     </span>
//                   </h1>

//                   <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-md">
//                     Explore thousands of questions across Technology, Healthcare, Education,
//                     and more. Share your expertise and learn from the community.
//                   </p>

//                   <div className="flex flex-wrap gap-3">
//                     <button
//                       onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })}
//                       className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
//                     >
//                       ✍️ Share Your Thoughts
//                     </button>
//                     <button
//                       onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
//                       className="px-6 py-2.5 rounded-full bg-white text-purple-600 text-sm font-semibold border-2 border-purple-200 shadow hover:border-purple-400 hover:shadow-lg hover:scale-105 transition-all duration-300"
//                     >
//                       📂 Browse Categories
//                     </button>
//                   </div>
//                 </div>

//                 {/* Right — floating stat cards */}
//                 <div className="relative flex-shrink-0 w-full md:w-64 h-44 hidden md:block">
//                   <div className="absolute top-0 left-0 animate-bounce" style={{ animationDuration: '3s' }}>
//                     <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-blue-200 shadow-xl text-center min-w-[130px]">
//                       <div className="text-3xl mb-1">💡</div>
//                       <p className="text-lg font-bold text-gray-800">10K+</p>
//                       <p className="text-xs text-gray-500">Questions Asked</p>
//                     </div>
//                   </div>
//                   <div className="absolute top-4 right-0 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
//                     <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-purple-200 shadow-xl text-center min-w-[130px]">
//                       <div className="text-3xl mb-1">⚡</div>
//                       <p className="text-lg font-bold text-gray-800">Fast</p>
//                       <p className="text-xs text-gray-500">Instant Answers</p>
//                     </div>
//                   </div>
//                   <div className="absolute bottom-0 left-8 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
//                     <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-pink-200 shadow-xl text-center min-w-[130px]">
//                       <div className="text-3xl mb-1">👥</div>
//                       <p className="text-lg font-bold text-gray-800">5K+</p>
//                       <p className="text-xs text-gray-500">Active Users</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* ═══ CATEGORIES BROWSE SECTION ══════════════════════════════════ */}
//             <div id="categories-section" className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-6">
//               <h2 className="text-xl font-extrabold mb-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//                 📂 Explore Popular Categories
//               </h2>

//               {catLoading ? (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                   {Array(6).fill(0).map((_, i) => (
//                     <div key={i} className="h-28 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl animate-pulse" />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                   {/* "All Topics" card */}
//                   <div
//                     onClick={() => { setActiveCat(null); document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' }); }}
//                     className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center ${
//                       activeCat === null
//                         ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-transparent text-white shadow-lg'
//                         : 'bg-white/80 border-gray-100 hover:border-purple-200'
//                     }`}
//                   >
//                     <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">🌐</div>
//                     <p className={`text-sm font-bold ${activeCat === null ? 'text-white' : 'text-gray-800'}`}>All Topics</p>
//                     <p className={`text-xs mt-0.5 ${activeCat === null ? 'text-white/70' : 'text-gray-400'}`}>Everything</p>
//                   </div>

//                   {/* Dynamic category cards from API */}
//                   {categories.map(cat => {
//                     const meta = getCategoryMeta(cat.categoryTitle);
//                     const isActive = activeCat === cat.categoryId;
//                     return (
//                       <div
//                         key={cat.categoryId}
//                         onClick={() => { setActiveCat(cat.categoryId); document.getElementById('feed-section')?.scrollIntoView({ behavior: 'smooth' }); }}
//                         className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center ${
//                           isActive
//                             ? `${meta.bg} border-transparent shadow-md`
//                             : 'bg-white/80 border-gray-100 hover:border-purple-200'
//                         }`}
//                       >
//                         {/* Show categoryImage if provided, else emoji */}
//                         <div className="mb-2 flex justify-center group-hover:scale-110 transition-transform duration-300">
//                           {cat.categoryImage
//                             ? <img src={cat.categoryImage} alt={cat.categoryTitle}
//                                 className="w-10 h-10 rounded-full object-cover shadow"
//                                 onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
//                               />
//                             : null
//                           }
//                           <span className={`text-3xl ${cat.categoryImage ? 'hidden' : ''}`}>{meta.emoji}</span>
//                         </div>
//                         <p className={`text-sm font-bold ${isActive ? meta.text : 'text-gray-800'}`}>
//                           {cat.categoryTitle}
//                         </p>
//                         <p className={`text-xs mt-0.5 ${isActive ? meta.text : 'text-gray-400'} line-clamp-1`}>
//                           {cat.categoryTagLine || 'Explore discussions'}
//                         </p>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>

//             {/* ═══ FEED HEADING ════════════════════════════════════════════════ */}
//             <div id="feed-section" className="flex items-center gap-3 pt-2">
//               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
//               <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
//                 {activeCat
//                   ? `${getCategoryMeta(categories.find(c => c.categoryId === activeCat)?.categoryTitle)?.emoji || ''} ${categories.find(c => c.categoryId === activeCat)?.categoryTitle || ''} Posts`
//                   : '🌐 All Posts'
//                 }
//               </span>
//               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
//             </div>

//             {/* Post Composer */}
//             <div id="composer">
//               <PostComposer user={user} categories={categories} onPostCreated={handlePostCreated} />
//             </div>

//             {/* Category Filter Tabs (horizontal scroll) */}
//             <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
//               <button
//                 onClick={() => setActiveCat(null)}
//                 className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
//                   activeCat === null
//                     ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
//                     : 'bg-white/60 text-gray-600 border border-white/60 hover:bg-white/80'
//                 }`}
//               >
//                 🌐 All
//               </button>
//               {categories.map(cat => {
//                 const meta = getCategoryMeta(cat.categoryTitle);
//                 return (
//                   <button
//                     key={cat.categoryId}
//                     onClick={() => setActiveCat(cat.categoryId)}
//                     className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
//                       activeCat === cat.categoryId
//                         ? `${meta.bg} ${meta.text} shadow-md border ${meta.border}`
//                         : 'bg-white/60 text-gray-600 border border-white/60 hover:bg-white/80'
//                     }`}
//                   >
//                     {meta.emoji} {cat.categoryTitle}
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Search status */}
//             {searchQuery && (
//               <div className="flex items-center justify-between bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-2.5">
//                 <p className="text-sm text-gray-600">
//                   {searchLoading
//                     ? <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Searching…</span>
//                     : <>Showing results for <strong className="text-purple-700">"{searchQuery}"</strong> — {searchResults?.length ?? 0} found</>
//                   }
//                 </p>
//                 <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
//                   ✕ Clear
//                 </button>
//               </div>
//             )}

//             {/* Feed */}
//             {feedLoading || searchLoading
//               ? Array(4).fill(0).map((_, i) => <PostSkeleton key={i} />)
//               : displayedPosts.length === 0
//                 ? <EmptyFeed onExplore={() => { setActiveCat(null); setSearchQuery(''); }} />
//                 : displayedPosts.map(post => (
//                     <PostCard key={post.postId} post={post} user={user} />
//                   ))
//             }
//           </main>

//           {/* ─── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
//           <aside className="hidden lg:block flex-shrink-0 w-72 sticky top-24 self-start space-y-4">

//             {/* Trending Categories */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-5">
//               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 🔥 <span>Trending Topics</span>
//               </h3>
//               {catLoading
//                 ? Array(4).fill(0).map((_, i) => (
//                     <div key={i} className="h-12 mb-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl animate-pulse" />
//                   ))
//                 : categories.slice(0, 6).map((cat, idx) => {
//                     const meta = getCategoryMeta(cat.categoryTitle);
//                     return (
//                       <button
//                         key={cat.categoryId}
//                         onClick={() => setActiveCat(cat.categoryId)}
//                         className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 group hover:shadow-md transition-all duration-200 ${
//                           activeCat === cat.categoryId
//                             ? `${meta.bg} ${meta.text} shadow-sm`
//                             : 'hover:bg-white/60'
//                         }`}
//                       >
//                         <span className="text-2xl">{meta.emoji}</span>
//                         <div className="flex-1 text-left">
//                           <p className={`text-sm font-semibold ${activeCat === cat.categoryId ? meta.text : 'text-gray-700'} group-hover:text-purple-700 transition-colors`}>
//                             {cat.categoryTitle}
//                           </p>
//                           <p className="text-xs text-gray-400">{cat.categoryTagLine || 'Explore discussions'}</p>
//                         </div>
//                         <span className={`text-xs font-bold ${meta.text} ${meta.bg} px-2 py-0.5 rounded-full`}>
//                           #{idx + 1}
//                         </span>
//                       </button>
//                     );
//                   })
//               }
//             </div>

//             {/* Platform stats */}
//             <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-5">
//               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 📊 <span>Community Stats</span>
//               </h3>
//               <div className="space-y-3">
//                 {[
//                   { icon: '💡', label: 'Questions Asked', value: '10,000+' },
//                   { icon: '⚡', label: 'Answers Given',   value: '45,000+' },
//                   { icon: '👥', label: 'Active Members',  value: '5,000+' },
//                   { icon: '📂', label: 'Categories',      value: `${categories.length}` },
//                 ].map(stat => (
//                   <div key={stat.label} className="flex items-center gap-3 py-2 border-b border-white/40 last:border-none">
//                     <span className="text-xl">{stat.icon}</span>
//                     <div className="flex-1">
//                       <p className="text-xs text-gray-500">{stat.label}</p>
//                     </div>
//                     <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                       {stat.value}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Tips for new users */}
//             <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-5 text-white">
//               <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3">💡 Pro Tip</span>
//               <h3 className="font-bold text-base mb-2">Get better answers faster</h3>
//               <p className="text-white/80 text-xs leading-relaxed mb-4">
//                 Add a clear title, detailed context, and choose the right category. Well-framed questions get 3× more responses!
//               </p>
//               <button
//                 onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })}
//                 className="w-full py-2 rounded-xl bg-white text-purple-700 text-sm font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
//               >
//                 ✍️ Share Your Thoughts
//               </button>
//             </div>

//             {/* Footer links */}
//             <div className="px-2">
//               <p className="text-xs text-gray-400 leading-relaxed">
//                 <a href="/about" className="hover:text-purple-600 transition-colors">About</a>
//                 {' · '}
//                 <a href="/privacy" className="hover:text-purple-600 transition-colors">Privacy</a>
//                 {' · '}
//                 <a href="/terms" className="hover:text-purple-600 transition-colors">Terms</a>
//                 {' · '}
//                 <a href="/help" className="hover:text-purple-600 transition-colors">Help</a>
//               </p>
//               <p className="text-xs text-gray-300 mt-1">© 2026 InfoCircle</p>
//             </div>
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomePage;















// V-F-1.02






