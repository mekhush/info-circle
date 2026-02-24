// SettingsPage.jsx — NEW PAGE
// User profile settings: notification prefs, account management, danger zone

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// If old users have email stored as userName, show only the part before '@'
const displayName = (userName) => {
  if (!userName) return 'Unknown';
  if (userName.includes('@')) return userName.split('@')[0];
  return userName;
};
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    email: true, comments: true, newPosts: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-5" style={{ paddingLeft: "calc(var(--sidebar-w, 0px) + 20px)" }}>
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/home')}
            className="p-2 rounded-full hover:bg-white/60 transition-colors text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            <p className="text-sm text-gray-500">Manage your account preferences</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Account Info */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">👤 Account</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {user?.userName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{displayName(user?.userName)}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <button onClick={() => navigate('/profile/edit')}
                className="ml-auto px-4 py-2 rounded-full border border-purple-300 text-purple-600 text-sm font-medium hover:bg-purple-50 transition-all">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">🔔 Notifications</h2>
            <div className="space-y-4">
              {[
                { key: 'email',    label: 'Email notifications',        desc: 'Receive updates via email' },
                { key: 'comments', label: 'Comment notifications',      desc: 'When someone replies to your post' },
                { key: 'newPosts', label: 'New post notifications',     desc: 'When new posts are published' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifications[key] ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={notifications[key]}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications[key] ? 'translate-x-5' : 'translate-x-0'
                    }`}/>
                  </button>
                </div>
              ))}
            </div>
            {saved && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                ✅ Preferences saved!
              </div>
            )}
            <button onClick={handleSave}
              className="mt-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
              Save Preferences
            </button>
          </div>

          {/* Privacy */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">🔒 Privacy & Security</h2>
            <div className="space-y-3">
              <button onClick={() => navigate('/profile/edit')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/60 transition-all text-sm text-gray-700 group">
                <span>Change Password</span>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/60 backdrop-blur-xl border border-red-200 rounded-3xl shadow-xl p-6">
            <h2 className="text-base font-semibold text-red-700 mb-4">⚠️ Account Actions</h2>
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-300 text-red-600 font-semibold text-sm hover:bg-red-100 hover:border-red-400 transition-all">
              🚪 Log Out
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;