import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import { categoryService } from '../../services/categoryService';
import api from '../../services/api';

const CreatePostPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ title: '', content: '', categoryId: '' });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  // ── Media state ────────────────────────────────────────────────────────────
  const [mediaFile, setMediaFile]       = useState(null);   // File object
  const [mediaPreview, setMediaPreview] = useState(null);   // Object URL for preview
  const [mediaType, setMediaType]       = useState(null);   // 'image' | 'video'
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    categoryService.getAllCategories()
      .then(setCategories)
      .catch(() => setError('Failed to load categories'))
      .finally(() => setCatLoading(false));
  }, []);

  // Clean up object URL when unmounting
  useEffect(() => {
    return () => { if (mediaPreview) URL.revokeObjectURL(mediaPreview); };
  }, [mediaPreview]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      setError('Only image or video files are supported.');
      return;
    }
    const maxMB = isVideo ? 50 : 10;
    if (file.size > maxMB * 1024 * 1024) {
      setError(`File too large. Maximum ${maxMB}MB allowed.`);
      return;
    }

    setError('');
    setMediaFile(file);
    setMediaType(isImage ? 'image' : 'video');
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleRemoveMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim())   { setError('Title is required'); return; }
    if (!formData.content.trim()) { setError('Content is required'); return; }
    if (!formData.categoryId)     { setError('Please select a category'); return; }

    setLoading(true);
    setUploadProgress(0);
    try {
      // Step 1 — Create post text
      const post = await postService.createPost(user.userId, formData.categoryId, {
        title:   formData.title.trim(),
        content: formData.content.trim(),
      });

      // Step 2 — Upload image if provided (API: POST /api/post/post/image/upload/{postId})
      if (mediaFile && mediaType === 'image') {
        setUploadProgress(50);
        try {
          await postService.uploadPostImage(post.postId, mediaFile);
          setUploadProgress(100);
        } catch {
          // Image upload failed — post still created successfully
          setSuccess('Post created! (Image upload failed — please try editing the post to add an image.)');
        }
      }

      setSuccess(success || 'Post published successfully! 🎉');
      setTimeout(() => navigate('/home'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-5"
      style={{ paddingLeft: 'calc(var(--sidebar-w, 0px) + 20px)' }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-1 leading-[1.3]">
                ✨ Share Something Amazing
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Inspire, inform, or spark a discussion with the community
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-gray-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-gray-100 text-sm"
            >
              ← Back
            </button>
          </div>

          {/* ── Alerts ──────────────────────────────────────────────────── */}
          {error && (
            <div className="mb-5 p-4 bg-red-50/80 border border-red-200 rounded-xl text-red-600 text-sm flex justify-between">
              <span>❌ {error}</span>
              <button onClick={() => setError('')}>✕</button>
            </div>
          )}
          {success && (
            <div className="mb-5 p-4 bg-green-50/80 border border-green-200 rounded-xl text-green-700 text-sm">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Category ────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              {catLoading ? (
                <div className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-500 animate-pulse">
                  Loading categories…
                </div>
              ) : (
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                  required
                >
                  <option value="">— Select a category —</option>
                  {categories.map(cat => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryTitle}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* ── Title ───────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title / Headline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                placeholder="Give your post a compelling headline…"
                required
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{formData.title.length} chars</p>
            </div>

            {/* ── Content ─────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={7}
                maxLength={20000}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-none"
                placeholder="Write your thoughts, ideas, or question in detail…"
                required
              />
              <p className={`text-xs mt-1 text-right ${formData.content.length > 18000 ? 'text-orange-500' : 'text-gray-400'}`}>{formData.content.length} / 20000 chars</p>
            </div>

            {/* ── Media Upload ─────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📷 Add Image or Video
                <span className="text-gray-400 font-normal ml-2">(optional — max 10MB image / 50MB video)</span>
              </label>

              {!mediaPreview ? (
                /* Drop zone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-purple-200 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📁</div>
                  <p className="text-sm text-gray-600 font-medium">Click to choose an image or video</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WEBP, MP4, MOV supported</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                /* Preview */
                <div className="relative rounded-xl overflow-hidden border border-white/60 bg-black/5">
                  {mediaType === 'image' ? (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full max-h-72 object-cover"
                    />
                  ) : (
                    <video
                      src={mediaPreview}
                      controls
                      className="w-full max-h-72"
                    />
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-semibold">
                      {mediaType === 'image' ? '🖼 Image' : '🎬 Video'}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveMedia}
                      className="px-2.5 py-1 rounded-full bg-red-500/80 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                    >
                      ✕ Remove
                    </button>
                  </div>
                  <p className="px-4 py-2 text-xs text-gray-500 bg-white/60">
                    {mediaFile?.name} ({(mediaFile?.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>

            {/* ── Upload progress ─────────────────────────────────────── */}
            {loading && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            {/* ── Actions ─────────────────────────────────────────────── */}
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={loading || catLoading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {uploadProgress > 0 ? `Uploading ${uploadProgress}%…` : 'Publishing…'}
                  </span>
                ) : '🚀 Publish Post'}
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

        {/* ── Tips ──────────────────────────────────────────────────────── */}
        <div className="mt-6 bg-blue-50/80 border border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-800 mb-3">💡 Tips for a great post:</h4>
          <ul className="space-y-1.5 text-sm text-gray-700">
            <li>• Use a clear, descriptive headline that captures your topic</li>
            <li>• Include all relevant details, context, and background</li>
            <li>• Add an image or video to make your post more engaging</li>
            <li>• Choose the most relevant category for better visibility</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;