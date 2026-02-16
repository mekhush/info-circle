import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const calculateCompletion = () => {
    let score = 25; // Base for having account
    if (user?.bio) score += 15;
    if (user?.about) score += 15;
    if (user?.address && user?.city && user?.pincode) score += 15;
    if (user?.profileImage) score += 30;
    return Math.min(score, 100);
  };

  const completion = calculateCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-5">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.userName} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-400"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  {user?.userName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {user?.userName}
              </h1>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              
              {user?.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
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
                  ></div>
                </div>
              </div>

              {/* ✅ Edit Profile Button */}
              <button
                onClick={() => navigate('/profile/edit')}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">About</h2>
          {user?.about ? (
            <p className="text-gray-700 whitespace-pre-line">{user.about}</p>
          ) : (
            <p className="text-gray-500 italic">No bio added yet. Click "Edit Profile" to add one.</p>
          )}
        </div>

        {/* Contact Information */}
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

        {/* Location */}
        {(user?.city || user?.address || user?.pincode) && (
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Location</h2>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                {user.address && <p className="text-gray-800">{user.address}</p>}
                {user.city && user.pincode && (
                  <p className="text-gray-800">{user.city} - {user.pincode}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Complete Profile Prompt */}
        {completion < 100 && (
          <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-3">💡 Complete Your Profile</h3>
            <ul className="space-y-2 text-sm text-gray-700 mb-4">
              {!user?.bio && <li>• Add a bio (+15%)</li>}
              {!user?.about && <li>• Add an about section (+15%)</li>}
              {(!user?.address || !user?.city || !user?.pincode) && (
                <li>• Add your location (+15%)</li>
              )}
              {!user?.profileImage && <li>• Upload a profile picture (+30%)</li>}
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