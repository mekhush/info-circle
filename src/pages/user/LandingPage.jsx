import React from 'react';
import DarkModeToggle from '../../components/common/DarkModeToggle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LockOverlay = ({ onLogin }) => (
  <div
    className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl
               bg-white/60 dark:bg-gray-900/75 backdrop-blur-sm cursor-pointer group"
    onClick={onLogin}
  >
    <div className="flex flex-col items-center gap-3 p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600
                      flex items-center justify-center shadow-xl
                      group-hover:scale-110 transition-transform duration-300">
        <span className="text-2xl">🔒</span>
      </div>
      <p className="text-gray-800 dark:text-gray-100 font-bold text-lg">Sign in to explore</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm">Join thousands of curious minds</p>
      <span className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600
                       text-white text-sm font-semibold shadow-lg
                       group-hover:shadow-xl transition-all duration-300">
        Get Started Free →
      </span>
    </div>
  </div>
);

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLockedClick = () => navigate('/signup');

  const categories = [
    { slug: 'technology',  emoji: '💻', title: 'Technology',  desc: 'Software, Hardware, AI & more',    count: '2.5K+ Questions', color: 'blue'   },
    { slug: 'healthcare',  emoji: '🏥', title: 'Healthcare',  desc: 'Medical advice & wellness tips',   count: '1.8K+ Questions', color: 'green'  },
    { slug: 'geopolitics', emoji: '🌍', title: 'Geopolitics', desc: 'World events & discussions',       count: '1.2K+ Questions', color: 'purple' },
    { slug: 'education',   emoji: '📚', title: 'Education',   desc: 'Learning & career guidance',       count: '3.1K+ Questions', color: 'orange' },
    { slug: 'business',    emoji: '💼', title: 'Business',    desc: 'Startups & entrepreneurship',      count: '900+ Questions',  color: 'pink'   },
    { slug: 'science',     emoji: '🔬', title: 'Science',     desc: 'Physics, Chemistry, Biology',      count: '1.5K+ Questions', color: 'indigo' },
  ];

  const colorMap = {
    blue:   { border: 'border-blue-100   dark:border-blue-900/40   hover:border-blue-300   dark:hover:border-blue-600',   badge: 'bg-blue-100   dark:bg-blue-900/50   text-blue-700   dark:text-blue-300'   },
    green:  { border: 'border-green-100  dark:border-green-900/40  hover:border-green-300  dark:hover:border-green-600',  badge: 'bg-green-100  dark:bg-green-900/50  text-green-700  dark:text-green-300'  },
    purple: { border: 'border-purple-100 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-600', badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' },
    orange: { border: 'border-orange-100 dark:border-orange-900/40 hover:border-orange-300 dark:hover:border-orange-600', badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300' },
    pink:   { border: 'border-pink-100   dark:border-pink-900/40   hover:border-pink-300   dark:hover:border-pink-600',   badge: 'bg-pink-100   dark:bg-pink-900/50   text-pink-700   dark:text-pink-300'   },
    indigo: { border: 'border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-300 dark:hover:border-indigo-600', badge: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50
                    dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">

      {/* ── STICKY HEADER: Logo + DarkMode + Auth buttons ───────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between
                         px-6 py-3
                         bg-white/70 dark:bg-gray-950/85 backdrop-blur-xl
                         border-b border-white/50 dark:border-gray-800/60 shadow-sm">
        <div className="flex items-center gap-2.5">
          <img
            src="/InfoCircle_logo_white.png"
            alt="InfoCircle"
            className="w-9 h-9 drop-shadow-md"
          />
          <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600
                           bg-clip-text text-transparent hidden sm:block">
            InfoCircle
          </span>
        </div>

        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-full text-sm font-semibold
                       border-2 border-purple-200 dark:border-purple-700
                       text-purple-600 dark:text-purple-300
                       hover:border-purple-400 dark:hover:border-purple-500
                       hover:bg-purple-50 dark:hover:bg-purple-900/30
                       transition-all duration-200"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-4 py-2 rounded-full text-sm font-semibold
                       bg-gradient-to-r from-blue-600 to-purple-600
                       text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative flex justify-center items-center min-h-screen px-5 pt-24 pb-20 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 w-[85%] max-w-7xl z-10">

          {/* Left Content */}
          <div className="flex-1 max-w-xl text-center lg:text-left">
            <span className="inline-block px-5 py-2 rounded-full
                             bg-white/80 dark:bg-white/10 backdrop-blur-md
                             border border-blue-200 dark:border-blue-800
                             text-blue-600 dark:text-blue-300 text-sm font-medium mb-5 shadow-lg">
              ✨ Knowledge Sharing Platform
            </span>

            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-5
                           text-gray-900 dark:text-white">
              Ask. Answer.
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
                               bg-clip-text text-transparent pb-4">
                {' '}Learn Together.
              </span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
              Join thousands of curious minds exploring topics from Technology
              to Healthcare. Get instant answers from experts and enthusiasts alike.<br />
              A place to share knowledge &amp; ideas
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600
                           text-white font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 rounded-full font-semibold shadow-lg
                           bg-white dark:bg-gray-800
                           text-purple-600 dark:text-purple-300
                           border-2 border-purple-200 dark:border-purple-700
                           hover:border-purple-400 dark:hover:border-purple-500
                           hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Right Side - Floating Stat Cards (PREMIUM DARK MODE) */}
          <div className="relative flex-1 h-[450px] w-full flex items-center justify-center">

            {/* Card 1 - top left */}
            <div className="absolute top-[20%] left-[10%] animate-float">
              <div className="p-6 rounded-2xl text-center min-w-[160px]
                              bg-white dark:bg-gray-800
                              border border-blue-200 dark:border-blue-700/70
                              shadow-xl dark:shadow-blue-950/50
                              ring-1 ring-blue-100 dark:ring-blue-900/40">
                <div className="text-5xl mb-3">💡</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">10K+</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Questions Asked</p>
              </div>
            </div>

            {/* Card 2 - middle right */}
            <div className="absolute top-[50%] right-[15%] animate-float animation-delay-1000">
              <div className="p-6 rounded-2xl text-center min-w-[160px]
                              bg-white dark:bg-gray-800
                              border border-purple-200 dark:border-purple-700/70
                              shadow-xl dark:shadow-purple-950/50
                              ring-1 ring-purple-100 dark:ring-purple-900/40">
                <div className="text-5xl mb-3">⚡</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Fast</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Instant Answers</p>
              </div>
            </div>

            {/* Card 3 - bottom center */}
            <div className="absolute bottom-[15%] left-[25%] animate-float animation-delay-2000">
              <div className="p-6 rounded-2xl text-center min-w-[160px]
                              bg-white dark:bg-gray-800
                              border border-pink-200 dark:border-pink-700/70
                              shadow-xl dark:shadow-pink-950/50
                              ring-1 ring-pink-100 dark:ring-pink-900/40">
                <div className="text-5xl mb-3">👥</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">5K+</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── CATEGORIES (locked for guests) ───────────────────────────────── */}
      <div className="flex justify-center px-5 py-16
                      bg-gradient-to-b from-white to-blue-50
                      dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
        <div className="w-[85%] max-w-7xl">
          <h2 className="text-5xl font-extrabold text-center mb-3
                         bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Explore Popular Categories
          </h2>
          <p className="text-center text-gray-400 dark:text-gray-500 mb-12 text-sm">
            🔒 Create a free account to browse and participate in discussions
          </p>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
                            pointer-events-none select-none">
              {categories.map((cat) => {
                const c = colorMap[cat.color];
                return (
                  <div key={cat.slug}
                       className={`p-8 rounded-2xl
                                   bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm
                                   border ${c.border}
                                   shadow-lg transition-all duration-300`}>
                    <div className="text-6xl mb-4">{cat.emoji}</div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{cat.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{cat.desc}</p>
                    <span className={`inline-block px-4 py-1 rounded-full text-xs font-semibold ${c.badge}`}>
                      {cat.count}
                    </span>
                  </div>
                );
              })}
            </div>
            <LockOverlay onLogin={handleLockedClick} />
          </div>
        </div>
      </div>

      {/* ── WHY CHOOSE US (locked for guests) ────────────────────────────── */}
      <div className="flex justify-center px-5 py-20
                      bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="w-[85%] max-w-7xl">
          <h2 className="text-5xl font-extrabold text-center mb-16
                         bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Why Choose InfoCircle?
          </h2>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8
                            pointer-events-none select-none">
              {[
                { emoji: '🎯', title: 'Focused Discussions', desc: 'Get straight to the point with organized Q&A format',    from: 'from-blue-50   dark:from-blue-950/30',   border: 'border-blue-100   dark:border-blue-900/40'   },
                { emoji: '👨‍🏫', title: 'Expert Answers',     desc: 'Learn from experienced professionals and enthusiasts',   from: 'from-purple-50  dark:from-purple-950/30', border: 'border-purple-100  dark:border-purple-900/40' },
                { emoji: '🔍', title: 'Easy Search',         desc: 'Find answers quickly with powerful search and filters',  from: 'from-pink-50    dark:from-pink-950/30',   border: 'border-pink-100    dark:border-pink-900/40'   },
                { emoji: '🌐', title: 'Global Community',    desc: 'Connect with people from around the world',              from: 'from-green-50   dark:from-green-950/30',  border: 'border-green-100   dark:border-green-900/40'  },
              ].map((f) => (
                <div key={f.title}
                     className={`p-8 rounded-2xl bg-gradient-to-br ${f.from} to-white dark:to-gray-800/50
                                 border ${f.border} text-center transition-all duration-300`}>
                  <div className="text-6xl mb-5">{f.emoji}</div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{f.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
            <LockOverlay onLogin={handleLockedClick} />
          </div>
        </div>
      </div>

      {/* ── CTA SECTION ──────────────────────────────────────────────────── */}
      <div className="flex justify-center px-5 py-20
                      bg-gradient-to-br from-blue-50 to-purple-50
                      dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
        <div className="w-[85%] max-w-4xl text-center p-16 rounded-3xl
                        bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm
                        border border-purple-200 dark:border-purple-800/40 shadow-2xl">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-800 dark:text-white mb-5">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
            Join our community today and unlock a world of knowledge
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-10 py-4 rounded-full text-lg font-semibold
                         bg-gradient-to-r from-blue-600 to-purple-600
                         text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 rounded-full text-lg font-semibold
                         border-2 border-purple-300 dark:border-purple-700
                         text-purple-600 dark:text-purple-300
                         hover:bg-purple-50 dark:hover:bg-purple-900/30
                         shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;











// Version- old before 23-02-2026







// import React from 'react';
// import DarkModeToggle from '../../components/common/DarkModeToggle';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// const LockOverlay = ({ onLogin }) => (
//   <div
//     className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl
//                bg-white/60 dark:bg-gray-900/75 backdrop-blur-sm cursor-pointer group"
//     onClick={onLogin}
//   >
//     <div className="flex flex-col items-center gap-3 p-6 text-center">
//       <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600
//                       flex items-center justify-center shadow-xl
//                       group-hover:scale-110 transition-transform duration-300">
//         <span className="text-2xl">🔒</span>
//       </div>
//       <p className="text-gray-800 dark:text-gray-100 font-bold text-lg">Sign in to explore</p>
//       <p className="text-gray-500 dark:text-gray-400 text-sm">Join thousands of curious minds</p>
//       <span className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600
//                        text-white text-sm font-semibold shadow-lg
//                        group-hover:shadow-xl transition-all duration-300">
//         Get Started Free →
//       </span>
//     </div>
//   </div>
// );

// const LandingPage = () => {
//   const { isAuthenticated } = useAuth();
//   const navigate = useNavigate();

//   const handleLockedClick = () => navigate('/signup');

//   const categories = [
//     { slug: 'technology',  emoji: '💻', title: 'Technology',  desc: 'Software, Hardware, AI & more',    count: '2.5K+ Questions', color: 'blue'   },
//     { slug: 'healthcare',  emoji: '🏥', title: 'Healthcare',  desc: 'Medical advice & wellness tips',   count: '1.8K+ Questions', color: 'green'  },
//     { slug: 'geopolitics', emoji: '🌍', title: 'Geopolitics', desc: 'World events & discussions',       count: '1.2K+ Questions', color: 'purple' },
//     { slug: 'education',   emoji: '📚', title: 'Education',   desc: 'Learning & career guidance',       count: '3.1K+ Questions', color: 'orange' },
//     { slug: 'business',    emoji: '💼', title: 'Business',    desc: 'Startups & entrepreneurship',      count: '900+ Questions',  color: 'pink'   },
//     { slug: 'science',     emoji: '🔬', title: 'Science',     desc: 'Physics, Chemistry, Biology',      count: '1.5K+ Questions', color: 'indigo' },
//   ];

//   const colorMap = {
//     blue:   { border: 'border-blue-100   dark:border-blue-900/40   hover:border-blue-300   dark:hover:border-blue-600',   badge: 'bg-blue-100   dark:bg-blue-900/50   text-blue-700   dark:text-blue-300'   },
//     green:  { border: 'border-green-100  dark:border-green-900/40  hover:border-green-300  dark:hover:border-green-600',  badge: 'bg-green-100  dark:bg-green-900/50  text-green-700  dark:text-green-300'  },
//     purple: { border: 'border-purple-100 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-600', badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' },
//     orange: { border: 'border-orange-100 dark:border-orange-900/40 hover:border-orange-300 dark:hover:border-orange-600', badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300' },
//     pink:   { border: 'border-pink-100   dark:border-pink-900/40   hover:border-pink-300   dark:hover:border-pink-600',   badge: 'bg-pink-100   dark:bg-pink-900/50   text-pink-700   dark:text-pink-300'   },
//     indigo: { border: 'border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-300 dark:hover:border-indigo-600', badge: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' },
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50
//                     dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">

//       {/* ── STICKY HEADER: Logo + DarkMode + Auth buttons ───────────────── */}
//       <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between
//                          px-6 py-3
//                          bg-white/70 dark:bg-gray-950/85 backdrop-blur-xl
//                          border-b border-white/50 dark:border-gray-800/60 shadow-sm">
//         <div className="flex items-center gap-2.5">
//           <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600
//                           flex items-center justify-center shadow-lg">
//             <span className="text-white font-black text-sm">IC</span>
//           </div>
//           <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600
//                            bg-clip-text text-transparent hidden sm:block">
//             InfoCircle
//           </span>
//         </div>

//         <div className="flex items-center gap-3">
//           <DarkModeToggle />
//           <button
//             onClick={() => navigate('/login')}
//             className="px-4 py-2 rounded-full text-sm font-semibold
//                        border-2 border-purple-200 dark:border-purple-700
//                        text-purple-600 dark:text-purple-300
//                        hover:border-purple-400 dark:hover:border-purple-500
//                        hover:bg-purple-50 dark:hover:bg-purple-900/30
//                        transition-all duration-200"
//           >
//             Sign In
//           </button>
//           <button
//             onClick={() => navigate('/signup')}
//             className="px-4 py-2 rounded-full text-sm font-semibold
//                        bg-gradient-to-r from-blue-600 to-purple-600
//                        text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
//           >
//             Sign Up
//           </button>
//         </div>
//       </header>

//       {/* ── HERO ─────────────────────────────────────────────────────────── */}
//       <div className="relative flex justify-center items-center min-h-screen px-5 pt-24 pb-20 overflow-hidden">
//         <div className="flex flex-col lg:flex-row items-center justify-between gap-16 w-[85%] max-w-7xl z-10">

//           {/* Left Content */}
//           <div className="flex-1 max-w-xl text-center lg:text-left">
//             <span className="inline-block px-5 py-2 rounded-full
//                              bg-white/80 dark:bg-white/10 backdrop-blur-md
//                              border border-blue-200 dark:border-blue-800
//                              text-blue-600 dark:text-blue-300 text-sm font-medium mb-5 shadow-lg">
//               ✨ Knowledge Sharing Platform
//             </span>

//             <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-5
//                            text-gray-900 dark:text-white">
//               Ask. Answer.
//               <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
//                                bg-clip-text text-transparent pb-4">
//                 {' '}Learn Together.
//               </span>
//             </h1>

//             <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
//               Join thousands of curious minds exploring topics from Technology
//               to Healthcare. Get instant answers from experts and enthusiasts alike.<br />
//               A place to share knowledge &amp; ideas
//             </p>

//             <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
//               <button
//                 onClick={() => navigate('/signup')}
//                 className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600
//                            text-white font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
//               >
//                 Get Started Free
//               </button>
//               <button
//                 onClick={() => navigate('/login')}
//                 className="px-8 py-3 rounded-full font-semibold shadow-lg
//                            bg-white dark:bg-gray-800
//                            text-purple-600 dark:text-purple-300
//                            border-2 border-purple-200 dark:border-purple-700
//                            hover:border-purple-400 dark:hover:border-purple-500
//                            hover:shadow-xl hover:scale-105 transition-all duration-300"
//               >
//                 Sign In
//               </button>
//             </div>
//           </div>

//           {/* Right Side - Floating Stat Cards (PREMIUM DARK MODE) */}
//           <div className="relative flex-1 h-[450px] w-full flex items-center justify-center">

//             {/* Card 1 - top left */}
//             <div className="absolute top-[20%] left-[10%] animate-float">
//               <div className="p-6 rounded-2xl text-center min-w-[160px]
//                               bg-white dark:bg-gray-800
//                               border border-blue-200 dark:border-blue-700/70
//                               shadow-xl dark:shadow-blue-950/50
//                               ring-1 ring-blue-100 dark:ring-blue-900/40">
//                 <div className="text-5xl mb-3">💡</div>
//                 <h3 className="text-2xl font-bold text-gray-800 dark:text-white">10K+</h3>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">Questions Asked</p>
//               </div>
//             </div>

//             {/* Card 2 - middle right */}
//             <div className="absolute top-[50%] right-[15%] animate-float animation-delay-1000">
//               <div className="p-6 rounded-2xl text-center min-w-[160px]
//                               bg-white dark:bg-gray-800
//                               border border-purple-200 dark:border-purple-700/70
//                               shadow-xl dark:shadow-purple-950/50
//                               ring-1 ring-purple-100 dark:ring-purple-900/40">
//                 <div className="text-5xl mb-3">⚡</div>
//                 <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Fast</h3>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">Instant Answers</p>
//               </div>
//             </div>

//             {/* Card 3 - bottom center */}
//             <div className="absolute bottom-[15%] left-[25%] animate-float animation-delay-2000">
//               <div className="p-6 rounded-2xl text-center min-w-[160px]
//                               bg-white dark:bg-gray-800
//                               border border-pink-200 dark:border-pink-700/70
//                               shadow-xl dark:shadow-pink-950/50
//                               ring-1 ring-pink-100 dark:ring-pink-900/40">
//                 <div className="text-5xl mb-3">👥</div>
//                 <h3 className="text-2xl font-bold text-gray-800 dark:text-white">5K+</h3>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>

//       {/* ── CATEGORIES (locked for guests) ───────────────────────────────── */}
//       <div className="flex justify-center px-5 py-16
//                       bg-gradient-to-b from-white to-blue-50
//                       dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
//         <div className="w-[85%] max-w-7xl">
//           <h2 className="text-5xl font-extrabold text-center mb-3
//                          bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//             Explore Popular Categories
//           </h2>
//           <p className="text-center text-gray-400 dark:text-gray-500 mb-12 text-sm">
//             🔒 Create a free account to browse and participate in discussions
//           </p>

//           <div className="relative">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
//                             pointer-events-none select-none">
//               {categories.map((cat) => {
//                 const c = colorMap[cat.color];
//                 return (
//                   <div key={cat.slug}
//                        className={`p-8 rounded-2xl
//                                    bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm
//                                    border ${c.border}
//                                    shadow-lg transition-all duration-300`}>
//                     <div className="text-6xl mb-4">{cat.emoji}</div>
//                     <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{cat.title}</h3>
//                     <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{cat.desc}</p>
//                     <span className={`inline-block px-4 py-1 rounded-full text-xs font-semibold ${c.badge}`}>
//                       {cat.count}
//                     </span>
//                   </div>
//                 );
//               })}
//             </div>
//             <LockOverlay onLogin={handleLockedClick} />
//           </div>
//         </div>
//       </div>

//       {/* ── WHY CHOOSE US (locked for guests) ────────────────────────────── */}
//       <div className="flex justify-center px-5 py-20
//                       bg-white dark:bg-gray-900 transition-colors duration-300">
//         <div className="w-[85%] max-w-7xl">
//           <h2 className="text-5xl font-extrabold text-center mb-16
//                          bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//             Why Choose InfoCircle?
//           </h2>

//           <div className="relative">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8
//                             pointer-events-none select-none">
//               {[
//                 { emoji: '🎯', title: 'Focused Discussions', desc: 'Get straight to the point with organized Q&A format',    from: 'from-blue-50   dark:from-blue-950/30',   border: 'border-blue-100   dark:border-blue-900/40'   },
//                 { emoji: '👨‍🏫', title: 'Expert Answers',     desc: 'Learn from experienced professionals and enthusiasts',   from: 'from-purple-50  dark:from-purple-950/30', border: 'border-purple-100  dark:border-purple-900/40' },
//                 { emoji: '🔍', title: 'Easy Search',         desc: 'Find answers quickly with powerful search and filters',  from: 'from-pink-50    dark:from-pink-950/30',   border: 'border-pink-100    dark:border-pink-900/40'   },
//                 { emoji: '🌐', title: 'Global Community',    desc: 'Connect with people from around the world',              from: 'from-green-50   dark:from-green-950/30',  border: 'border-green-100   dark:border-green-900/40'  },
//               ].map((f) => (
//                 <div key={f.title}
//                      className={`p-8 rounded-2xl bg-gradient-to-br ${f.from} to-white dark:to-gray-800/50
//                                  border ${f.border} text-center transition-all duration-300`}>
//                   <div className="text-6xl mb-5">{f.emoji}</div>
//                   <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{f.title}</h3>
//                   <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
//                 </div>
//               ))}
//             </div>
//             <LockOverlay onLogin={handleLockedClick} />
//           </div>
//         </div>
//       </div>

//       {/* ── CTA SECTION ──────────────────────────────────────────────────── */}
//       <div className="flex justify-center px-5 py-20
//                       bg-gradient-to-br from-blue-50 to-purple-50
//                       dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
//         <div className="w-[85%] max-w-4xl text-center p-16 rounded-3xl
//                         bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm
//                         border border-purple-200 dark:border-purple-800/40 shadow-2xl">
//           <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-800 dark:text-white mb-5">
//             Ready to Start Learning?
//           </h2>
//           <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
//             Join our community today and unlock a world of knowledge
//           </p>
//           <div className="flex flex-wrap gap-4 justify-center">
//             <button
//               onClick={() => navigate('/signup')}
//               className="px-10 py-4 rounded-full text-lg font-semibold
//                          bg-gradient-to-r from-blue-600 to-purple-600
//                          text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
//             >
//               Create Free Account
//             </button>
//             <button
//               onClick={() => navigate('/login')}
//               className="px-10 py-4 rounded-full text-lg font-semibold
//                          border-2 border-purple-300 dark:border-purple-700
//                          text-purple-600 dark:text-purple-300
//                          hover:bg-purple-50 dark:hover:bg-purple-900/30
//                          shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
//             >
//               Sign In
//             </button>
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default LandingPage;