import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ProfileEditPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    userName: '',
    bio: '',
    about: '',
    address: '',
    city: '',
    pincode: '',
    profileImage: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Load current user data
  useEffect(() => {
    if (user) {
      setProfile({
        userName: user.username || '',
        bio: user.bio || '',
        about: user.about || '',
        address: user.address || '',
        city: user.city || '',
        pincode: user.pincode || '',
        profileImage: user.profileImage || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put(`/user/updateProfile/${user.userId}`, profile);
      
      // Update user in context
      updateUser(response.data);
      
      setSuccess('Profile updated successfully! 🎉');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = () => {
    let score = 25; // Base for having account
    if (profile.bio) score += 15;
    if (profile.about) score += 15;
    if (profile.address && profile.city && profile.pincode) score += 15;
    if (profile.profileImage) score += 20;
    return Math.min(score, 100);
  };

  const completion = calculateCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-5">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-2 leading-[1.3]">
              Edit Profile
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Profile Completion */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Profile Completion: {completion}%
              </span>
              <span className="text-xs text-gray-500">
                {completion < 100 ? 'Keep going!' : 'Complete! 🎉'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-xl text-green-600 text-sm">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                👤 Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={profile.userName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    placeholder="Your display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio <span className="text-xs text-gray-500">(+15%)</span>
                  </label>
                  <input
                    type="text"
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    maxLength="150"
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    placeholder="A short bio about yourself (150 characters)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {profile.bio.length}/150 characters
                  </p>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                📝 About You <span className="text-xs text-gray-500 ml-2">(+15%)</span>
              </h3>
              
              <textarea
                name="about"
                value={profile.about}
                onChange={handleChange}
                rows="5"
                maxLength="1000"
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-none"
                placeholder="Tell us more about yourself, your interests, expertise..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {profile.about.length}/1000 characters
              </p>
            </div>

            {/* Location Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                📍 Location <span className="text-xs text-gray-500 ml-2">(+15%)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={profile.pincode}
                    onChange={handleChange}
                    maxLength="6"
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    placeholder="123456"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    placeholder="Your city"
                  />
                </div>
              </div>
            </div>

            {/* Profile Image */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                📷 Profile Picture <span className="text-xs text-gray-500 ml-2">(+20%)</span>
              </h3>
              
              <input
                type="text"
                name="profileImage"
                value={profile.profileImage}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                placeholder="Profile image URL"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Upload your image to a service like Imgur and paste the URL here.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
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
        <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-800 mb-3">💡 Profile Tips:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• A complete profile helps others understand your expertise</li>
            <li>• Your bio appears in search results and on your posts</li>
            <li>• Location helps connect with people in your area</li>
            <li>• Profile pictures increase engagement by 40%!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditPage;