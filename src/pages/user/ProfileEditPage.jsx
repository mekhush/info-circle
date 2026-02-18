// ProfileEditPage.jsx
// FIX: This file was incorrectly a copy of SignupPage. Now a proper Edit Profile page.
// API: PUT /api/user/update/{id}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

const hasValue = (val) => val && typeof val === 'string' && val.trim().length > 0 && val.trim() !== ' ';

const ProfileEditPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName:     user?.userName     || '',
    email:        user?.email        || '',
    mobileNumber: user?.mobileNumber || '',
    bio:          hasValue(user?.bio)     ? user.bio.trim()     : '',
    about:        hasValue(user?.about)   ? user.about.trim()   : '',
    address:      hasValue(user?.address) ? user.address.trim() : '',
    city:         hasValue(user?.city)    ? user.city.trim()    : '',
    pincode:      user?.pincode || '',
    password:     '',
  });

  const [photoFile, setPhotoFile]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    hasValue(user?.profileImage) ? user.profileImage : null
  );
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        userName:     formData.userName     || user.userName,
        email:        formData.email        || user.email,
        mobileNumber: Number(formData.mobileNumber) || user.mobileNumber || 0,
        bio:          formData.bio.trim()     || ' ',
        about:        formData.about.trim()   || ' ',
        address:      formData.address.trim() || ' ',
        city:         formData.city.trim()    || ' ',
        pincode:      Number(formData.pincode) || 0,
        profileImage: user?.profileImage      || ' ',
        ...(formData.password.trim() ? { password: formData.password.trim() } : {}),
      };

      const updatedUser = await userService.updateUser(user.userId, payload);

      // If photo was chosen, attach preview URL (backend image upload is a separate flow)
      if (photoFile) {
        updatedUser.profileImage = photoPreview;
      }

      updateUser(updatedUser);
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message ||
        'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const completion = (() => {
    let score = 25;
    if (formData.bio.trim())     score += 15;
    if (formData.about.trim())   score += 15;
    if (formData.address.trim() && formData.city.trim() && formData.pincode) score += 15;
    if (photoPreview)            score += 20;
    return Math.min(score, 100);
  })();

  const inputClass =
    'w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 transition-all text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-5" style={{ paddingLeft: "calc(var(--sidebar-w, 0px) + 20px)" }}>
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/profile')}
            className="p-2 rounded-full hover:bg-white/60 transition-colors text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
            <p className="text-sm text-gray-500">Update your personal information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {error   && <div className="p-4 bg-red-50/80 border border-red-200 rounded-xl text-red-600 text-sm">❌ {error}</div>}
          {success && <div className="p-4 bg-green-50/80 border border-green-200 rounded-xl text-green-700 text-sm font-medium">✅ {success}</div>}

          {/* Profile Photo */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Profile Photo</h2>
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-300 shadow-lg"/>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                    {user?.userName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-dashed border-purple-300 text-purple-600 font-medium text-sm hover:bg-purple-50 hover:border-purple-400 transition-all">
                  📷 {photoPreview ? 'Change Photo' : 'Upload Photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange}/>
                </label>
                <p className="text-xs text-gray-400 mt-2">JPG, PNG or GIF · Max 5 MB</p>
                {photoFile && <p className="text-xs text-green-600 mt-1 font-medium">✓ {photoFile.name} selected</p>}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-800">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Username</label>
                <input type="text" name="userName" value={formData.userName}
                  onChange={handleChange} className={inputClass} placeholder="Your name" required/>
              </div>
              <div>
                <label className={labelClass}>Mobile Number</label>
                <input type="tel" name="mobileNumber" value={formData.mobileNumber}
                  onChange={handleChange} className={inputClass} placeholder="10-digit mobile" maxLength="10"/>
              </div>
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" name="email" value={formData.email}
                className={inputClass + ' opacity-60 cursor-not-allowed'} readOnly
                title="Email cannot be changed"/>
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className={labelClass}>Short Bio</label>
              <input type="text" name="bio" value={formData.bio} onChange={handleChange}
                className={inputClass} placeholder="e.g. Software engineer · Coffee lover" maxLength="120"/>
              <p className="text-xs text-gray-400 mt-1 text-right">{formData.bio.length}/120</p>
            </div>
            <div>
              <label className={labelClass}>About</label>
              <textarea name="about" value={formData.about} onChange={handleChange}
                className={inputClass + ' resize-none'} rows={4}
                placeholder="Tell the community about yourself..."/>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-800">📍 Location</h2>
            <div>
              <label className={labelClass}>Address</label>
              <input type="text" name="address" value={formData.address}
                onChange={handleChange} className={inputClass} placeholder="Street / Area"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City</label>
                <input type="text" name="city" value={formData.city}
                  onChange={handleChange} className={inputClass} placeholder="City"/>
              </div>
              <div>
                <label className={labelClass}>Pincode</label>
                <input type="number" name="pincode" value={formData.pincode}
                  onChange={handleChange} className={inputClass} placeholder="000000"/>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">🔒 Change Password</h2>
            <div>
              <label className={labelClass}>New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></label>
              <input type="password" name="password" value={formData.password}
                onChange={handleChange} className={inputClass} placeholder="Enter new password" minLength={6}/>
            </div>
          </div>

          {/* Completion bar */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-500 font-medium">Profile Completion</span>
                <span className="text-xs font-bold text-purple-600">{completion}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${completion}%` }}/>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/profile')}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:scale-100">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Saving…
                </span>
              ) : '💾 Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProfileEditPage;