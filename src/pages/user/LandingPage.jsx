import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Banner Section - Full viewport */}
      <div className="relative flex justify-center items-center min-h-screen px-5 py-20 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 w-[85%] max-w-7xl z-10">
          {/* Left Content */}
          <div className="flex-1 max-w-xl text-center lg:text-left">
            <span className="inline-block px-5 py-2 rounded-full bg-white/80 backdrop-blur-md border border-blue-200 text-blue-600 text-sm font-medium mb-5 shadow-lg">
              ✨ Knowledge Sharing Platform
            </span>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
              Ask. Answer.
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent pb-4">
                {' '}Learn Together.
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Join thousands of curious minds exploring topics from Technology 
              to Healthcare. Get instant answers from experts and enthusiasts alike.<br></br>
              A place to share knowledge & ideas
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate('/home')}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    Explore Questions
                  </button>
                  <button
                    onClick={() => navigate('/create-post')}
                    className="px-8 py-3 rounded-full bg-white text-purple-600 font-semibold shadow-lg border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Ask a Question
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    Get Started Free
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-3 rounded-full bg-white text-purple-600 font-semibold shadow-lg border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Right Side - Floating Cards */}
          <div className="relative flex-1 h-[450px] w-full flex items-center justify-center">
            <div className="absolute top-[20%] left-[10%] animate-float">
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-blue-200 shadow-xl text-center min-w-[160px]">
                <div className="text-5xl mb-3">💡</div>
                <h3 className="text-2xl font-bold text-gray-800">10K+</h3>
                <p className="text-sm text-gray-600">Questions Asked</p>
              </div>
            </div>
            
            <div className="absolute top-[50%] right-[15%] animate-float animation-delay-1000">
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-purple-200 shadow-xl text-center min-w-[160px]">
                <div className="text-5xl mb-3">⚡</div>
                <h3 className="text-2xl font-bold text-gray-800">Fast</h3>
                <p className="text-sm text-gray-600">Instant Answers</p>
              </div>
            </div>
            
            <div className="absolute bottom-[15%] left-[25%] animate-float animation-delay-2000">
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-pink-200 shadow-xl text-center min-w-[160px]">
                <div className="text-5xl mb-3">👥</div>
                <h3 className="text-2xl font-bold text-gray-800">5K+</h3>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="flex justify-center px-5 py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="w-[85%] max-w-7xl">
          <h2 className="text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Explore Popular Categories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Technology */}
            <div className="group p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-100 hover:border-blue-300 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">💻</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Technology</h3>
              <p className="text-gray-600 text-sm mb-3">Software, Hardware, AI & more</p>
              <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                2.5K+ Questions
              </span>
            </div>
            
            {/* Healthcare */}
            <div className="group p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-green-100 hover:border-green-300 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🏥</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Healthcare</h3>
              <p className="text-gray-600 text-sm mb-3">Medical advice & wellness tips</p>
              <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                1.8K+ Questions
              </span>
            </div>
            
            {/* Geopolitics */}
            <div className="group p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-purple-100 hover:border-purple-300 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🌍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Geopolitics</h3>
              <p className="text-gray-600 text-sm mb-3">World events & discussions</p>
              <span className="inline-block px-4 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                1.2K+ Questions
              </span>
            </div>
            
            {/* Education */}
            <div className="group p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-orange-100 hover:border-orange-300 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📚</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Education</h3>
              <p className="text-gray-600 text-sm mb-3">Learning & career guidance</p>
              <span className="inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                3.1K+ Questions
              </span>
            </div>
            
            {/* Business */}
            <div className="group p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-pink-100 hover:border-pink-300 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">💼</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Business</h3>
              <p className="text-gray-600 text-sm mb-3">Startups & entrepreneurship</p>
              <span className="inline-block px-4 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold">
                900+ Questions
              </span>
            </div>
            
            {/* Science */}
            <div className="group p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-indigo-100 hover:border-indigo-300 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🔬</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Science</h3>
              <p className="text-gray-600 text-sm mb-3">Physics, Chemistry, Biology</p>
              <span className="inline-block px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                1.5K+ Questions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="flex justify-center px-5 py-20 bg-white">
        <div className="w-[85%] max-w-7xl">
          <h2 className="text-5xl font-extrabold text-center mb-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Why Choose InfoCircle?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-6xl mb-5">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Focused Discussions</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get straight to the point with organized Q&A format
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-6xl mb-5">👨‍🏫</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Expert Answers</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Learn from experienced professionals and enthusiasts
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-white border border-pink-100 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-6xl mb-5">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Easy Search</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Find answers quickly with powerful search and filters
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-white border border-green-100 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-6xl mb-5">🌐</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Global Community</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Connect with people from around the world
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="flex justify-center px-5 py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="w-[85%] max-w-4xl text-center p-16 rounded-3xl bg-white/80 backdrop-blur-sm border border-purple-200 shadow-2xl">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-800 mb-5">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join our community today and unlock a world of knowledge
          </p>
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/signup')}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Create Free Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;