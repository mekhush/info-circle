// ── WHAT CHANGED (same exact design, data display fixes only) ────────────────
//
// BUG 1: Placeholder " " (space) values from signup showed as real data.
//   When signing up, authService sends bio=" ", about=" ", address=" ", city=" "
//   to satisfy backend @NotEmpty. These are truthy so user?.bio evaluated to true
//   and the space was rendered visibly. Same for profileImage → broken <img>.
//
//   Fix: helper function hasValue() trims before checking.
//     hasValue(user?.bio)  →  true only if bio exists AND has real text content.
//
// BUG 2: Completion score was wrong.
//   Old: profileImage score was +30% here but ProfileEditPage showed +20%.
//   Fix: aligned to +20% to match ProfileEditPage.
//
// BUG 3: No role badge — user couldn't see if they're ADMIN or USER.
//   Fix: added a small role pill badge next to the username.
//
// BUG 4: Completion checklist showed items already "filled" with spaces.
//   Fix: all checks now use hasValue() instead of bare truthiness.
//
// Design: 100% unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ✅ Helper: returns true only if value exists AND is not just whitespace
const hasValue = (val) => val && typeof val === 'string' && val.trim().length > 0 && val.trim() !== ' ';

const ProfilePage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // ✅ Fixed: all checks use hasValue() so placeholder spaces don't count
  const calculateCompletion = () => {
    let score = 25; // base for having an account
    if (hasValue(user?.bio)) score += 15;
    if (hasValue(user?.about)) score += 15;
    if (hasValue(user?.address) && hasValue(user?.city) && user?.pincode) score += 15;
    if (hasValue(user?.profileImage)) score += 20; // ← was 30, aligned with ProfileEditPage
    return Math.min(score, 100);
  };

  const completion = calculateCompletion();

  // Role derived from roles array (from backend UserDto)
  const userRole = user?.roles?.find((r) => r.roleName === 'ADMIN') ? 'ADMIN' : 'USER';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-5" style={{ paddingLeft: "calc(var(--sidebar-w, 0px) + 20px)" }}>
      <div className="max-w-4xl mx-auto">

        {/* ── Profile Header ────────────────────────────────────────────────── */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-8">

            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {/* ✅ Fixed: only show image if hasValue (not a space placeholder) */}
              {hasValue(user?.profileImage) ? (
                <img
                  src={user.profileImage}
                  alt={user.userName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-400"
                  onError={(e) => {
                    // If image URL fails to load, fall back to initial avatar
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 items-center justify-center text-white text-4xl font-bold"
                style={{ display: hasValue(user?.profileImage) ? 'none' : 'flex' }}
              >
                {user?.userName?.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {/* Name + Role badge */}
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <h1 className="text-3xl font-bold text-gray-800">
                  {user?.userName}
                </h1>
                {/* ✅ NEW: role badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  userRole === 'ADMIN'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  {userRole === 'ADMIN' ? '👑 Admin' : '👤 User'}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{user?.email}</p>

              {/* ✅ Fixed: only show bio if it has real content */}
              {hasValue(user?.bio) && (
                <p className="text-gray-700 mb-4">{user.bio.trim()}</p>
              )}

              {/* Profile Completion */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Profile Completion</span>
                  <span className="text-sm font-semibold text-purple-600">{completion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => navigate('/profile/edit')}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* ── About Section ─────────────────────────────────────────────────── */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">About</h2>
          {/* ✅ Fixed: hasValue guard */}
          {hasValue(user?.about) ? (
            <p className="text-gray-700 whitespace-pre-line">{user.about.trim()}</p>
          ) : (
            <p className="text-gray-500 italic">
              No about section yet.{' '}
              <button
                onClick={() => navigate('/profile/edit')}
                className="text-purple-600 hover:underline font-medium"
              >
                Add one →
              </button>
            </p>
          )}
        </div>

        {/* ── Contact Information ───────────────────────────────────────────── */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-800 font-medium">{user?.email}</p>
              </div>
            </div>

            {user?.mobileNumber && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="text-sm text-gray-600">Mobile</p>
                  <p className="text-gray-800 font-medium">{user.mobileNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Location ─────────────────────────────────────────────────────── */}
        {/* ✅ Fixed: hasValue guards on address and city */}
        {(hasValue(user?.city) || hasValue(user?.address) || user?.pincode) && (
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Location</h2>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                {hasValue(user?.address) && (
                  <p className="text-gray-800">{user.address.trim()}</p>
                )}
                {hasValue(user?.city) && user?.pincode && (
                  <p className="text-gray-800">{user.city.trim()} - {user.pincode}</p>
                )}
                {hasValue(user?.city) && !user?.pincode && (
                  <p className="text-gray-800">{user.city.trim()}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Complete Profile Prompt ───────────────────────────────────────── */}
        {/* ✅ Fixed: all checklist items use hasValue() */}
        {completion < 100 && (
          <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-3">💡 Complete Your Profile</h3>
            <ul className="space-y-2 text-sm text-gray-700 mb-4">
              {!hasValue(user?.bio) && (
                <li>• Add a short bio (+15%)</li>
              )}
              {!hasValue(user?.about) && (
                <li>• Add an about section (+15%)</li>
              )}
              {(!hasValue(user?.address) || !hasValue(user?.city) || !user?.pincode) && (
                <li>• Add your location (+15%)</li>
              )}
              {!hasValue(user?.profileImage) && (
                <li>• Upload a profile picture (+20%)</li>
              )}
            </ul>
            <button
              onClick={() => navigate('/profile/edit')}
              className="px-6 py-2 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
            >
              Complete Profile
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;