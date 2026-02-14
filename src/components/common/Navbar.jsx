import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/home?search=${searchQuery}`);
    }
  };

  return (
    // Fixed positioning to overlay on top of content
    <div className="fixed top-0 left-0 right-0 flex justify-center pt-5 z-50">
      {/* White floating island navbar */}
      <nav className="flex items-center justify-between gap-5 w-[85%] max-w-7xl px-8 py-4 rounded-full bg-white/5 backdrop-blur border border-gray-200 shadow-xl">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 hover:scale-105 transition-transform duration-300"
        >
          <img 
            src="/InfoCircle_logo_white.png" 
            alt="InfoCircle Logo" 
            className="w-10 h-10 object-contain"
          />
          <span className="hidden lg:block text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            InfoCircle
          </span>
        </Link>

        {/* Search Bar - Only for authenticated users */}
        {isAuthenticated && (
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-5 py-2 rounded-full border border-gray-300 bg-white/90 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Search
            </button>
          </form>
        )}

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link
                to="/home"
                className="hidden md:block text-gray-700 font-medium hover:text-purple-600 transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                to="/create-post"
                className="hidden md:block text-gray-700 font-medium hover:text-purple-600 transition-colors duration-200"
              >
                Ask Question
              </Link>
              
              {/* Admin Link */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden md:block px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  🔐 Admin
                </Link>
              )}
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                >
                  <span className="text-xl">👤</span>
                  <span className="hidden lg:block text-gray-700 font-medium">
                    {user?.userName}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-2xl shadow-2xl border border-gray-200 animate-fadeIn">
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="block px-5 py-3 text-gray-700 hover:bg-purple-50 transition-colors duration-200"
                    >
                      👤 Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 font-medium hover:text-purple-600 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;