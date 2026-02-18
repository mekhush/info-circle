// Navbar.jsx — ANIMATED SIDEBAR + DARK MODE TOGGLE
//
// Behaviour:
//   /home, /, /login, /signup  →  hidden (HomePage has its own top navbar)
//   all other authenticated pages → vertical sidebar slides in from LEFT
//
// Dark mode toggle lives at the bottom of the sidebar.
// On /home the toggle is placed inside HomePage's own navbar (see HomePage.jsx).

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DarkModeToggle from './DarkModeToggle';

const HIDE_ON = ['/', '/login', '/signup', '/home'];

const GRADIENTS = [
  'from-blue-500 to-purple-600', 'from-purple-500 to-pink-600',
  'from-green-500 to-teal-600',  'from-orange-500 to-red-600',
  'from-indigo-500 to-blue-600',
];
const avatarGradient = (id) => GRADIENTS[(id || 0) % GRADIENTS.length];
const getInitials    = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home Feed',     href: '/home'        },
  { icon: '🌐', label: 'Explore Posts', href: '/all-posts'   },
  { icon: '👤', label: 'My Profile',    href: '/profile'     },
  { icon: '📝', label: 'My Posts',      href: '/my-posts'    },
  { icon: '✍️', label: 'Create Post',   href: '/create-post' },
  { icon: '⚙️', label: 'Settings',      href: '/settings'    },
];

const SIDEBAR_EXPANDED  = 220;
const SIDEBAR_COLLAPSED = 68;

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(true);
  const [visible,  setVisible]  = useState(false);

  const path        = location.pathname;
  const showSidebar = isAuthenticated && !HIDE_ON.includes(path);

  useEffect(() => {
    if (showSidebar) {
      const t = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [showSidebar]);

  useEffect(() => {
    const w = showSidebar && visible
      ? `${expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED}px`
      : '0px';
    document.documentElement.style.setProperty('--sidebar-w', w);
  }, [showSidebar, visible, expanded]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleNavClick = (e, href) => {
    if (href === '/home') {
      e.preventDefault();
      setVisible(false);
      document.documentElement.style.setProperty('--sidebar-w', '0px');
      setTimeout(() => navigate('/home'), 360);
    }
  };

  if (!showSidebar) return null;

  return (
    <aside
      style={{
        width:     expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED,
        transform: visible ? 'translateX(0)' : 'translateX(-110%)',
        opacity:   visible ? 1 : 0,
        transition: [
          'transform 0.38s cubic-bezier(0.34, 1.26, 0.64, 1)',
          'opacity 0.32s ease',
          'width 0.28s ease',
        ].join(', '),
      }}
      className="fixed top-0 left-0 h-screen z-50 flex flex-col
                 bg-white/75 dark:bg-gray-950/95
                 backdrop-blur-2xl
                 border-r border-white/50 dark:border-purple-900/40
                 shadow-2xl shadow-purple-100/50 dark:shadow-purple-950/60
                 overflow-hidden select-none"
    >
      {/* ── TOP: Logo + collapse ─────────────────────────────────────────── */}
      <div className={`flex items-center border-b border-white/40 dark:border-purple-900/30 py-5
                       ${expanded ? 'px-4 justify-between' : 'px-0 justify-center flex-col gap-3'}`}>
        <Link
          to="/home"
          onClick={(e) => handleNavClick(e, '/home')}
          className="flex items-center gap-2.5 min-w-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600
                          flex items-center justify-center shadow-lg flex-shrink-0
                          hover:scale-110 transition-transform duration-200">
            <span className="text-white font-black text-sm">IC</span>
          </div>
          {expanded && (
            <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600
                             bg-clip-text text-transparent truncate">
              InfoCircle
            </span>
          )}
        </Link>

        <button
          onClick={() => setExpanded(v => !v)}
          className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30
                     transition-colors flex-shrink-0"
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-300
                        ${expanded ? '' : 'rotate-180'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      {/* ── USER CARD ────────────────────────────────────────────────────── */}
      <div className={`flex items-center gap-3 border-b border-white/40 dark:border-purple-900/30 py-4
                       ${expanded ? 'px-4' : 'px-0 justify-center'}`}>
        <div className={`flex-shrink-0 rounded-full bg-gradient-to-br ${avatarGradient(user?.userId)}
                         flex items-center justify-center text-white font-bold shadow-md
                         ${expanded ? 'w-10 h-10 text-sm' : 'w-9 h-9 text-xs'}`}>
          {getInitials(user?.userName)}
        </div>
        {expanded && (
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate leading-tight">
              {user?.userName}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
              {user?.email}
            </p>
          </div>
        )}
      </div>

      {/* ── NAV LINKS ────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-0.5 px-2">
        {NAV_ITEMS.map((item, idx) => {
          const active = path === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              title={!expanded ? item.label : undefined}
              style={{ animationDelay: visible ? `${idx * 45}ms` : '0ms',
                       animation: visible ? 'navItemSlide 0.35s ease both' : 'none' }}
              className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium
                          transition-colors duration-150 group relative
                          ${expanded ? 'px-3' : 'px-0 justify-center'}
                          ${active
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-200/50 dark:shadow-purple-900/50'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300'
                          }`}
            >
              <span className={`text-lg leading-none flex-shrink-0
                                ${!active ? 'group-hover:scale-110 transition-transform duration-150' : ''}`}>
                {item.icon}
              </span>
              {expanded && <span className="truncate leading-tight">{item.label}</span>}
              {active && expanded && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80 flex-shrink-0"/>
              )}
              {!expanded && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg
                                 bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium whitespace-nowrap
                                 opacity-0 group-hover:opacity-100 pointer-events-none
                                 transition-opacity duration-150 shadow-xl z-[60]">
                  {item.label}
                  <span className="absolute right-full top-1/2 -translate-y-1/2
                                   border-[5px] border-transparent border-r-gray-900 dark:border-r-gray-800"/>
                </span>
              )}
            </Link>
          );
        })}

        {isAdmin && isAdmin() && (
          <Link to="/admin"
            title={!expanded ? 'Admin Panel' : undefined}
            className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium mt-2
                        transition-colors duration-150 group relative
                        ${expanded ? 'px-3' : 'px-0 justify-center'}
                        ${path === '/admin'
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                          : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
          >
            <span className="text-lg leading-none flex-shrink-0 group-hover:scale-110 transition-transform">👑</span>
            {expanded && <span>Admin Panel</span>}
            {!expanded && (
              <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg
                               bg-gray-900 text-white text-xs font-medium whitespace-nowrap
                               opacity-0 group-hover:opacity-100 pointer-events-none
                               transition-opacity duration-150 shadow-xl z-[60]">
                Admin Panel
                <span className="absolute right-full top-1/2 -translate-y-1/2
                                 border-[5px] border-transparent border-r-gray-900"/>
              </span>
            )}
          </Link>
        )}
      </nav>

      {/* ── DARK MODE TOGGLE ─────────────────────────────────────────────── */}
      <div className={`px-2 pt-3 pb-2 border-t border-white/40 dark:border-purple-900/30
                       flex items-center gap-3
                       ${expanded ? 'px-4' : 'justify-center px-0'}`}>
        <DarkModeToggle />
        {expanded && (
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Theme
          </span>
        )}
      </div>

      {/* ── LOGOUT ───────────────────────────────────────────────────────── */}
      <div className="px-2 pb-4">
        <button
          onClick={handleLogout}
          title={!expanded ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium
                      text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                      transition-colors duration-150 group relative
                      ${expanded ? 'px-3' : 'px-0 justify-center'}`}
        >
          <span className="text-lg leading-none flex-shrink-0 group-hover:scale-110 transition-transform">🚪</span>
          {expanded && <span>Logout</span>}
          {!expanded && (
            <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg
                             bg-gray-900 text-white text-xs font-medium whitespace-nowrap
                             opacity-0 group-hover:opacity-100 pointer-events-none
                             transition-opacity duration-150 shadow-xl z-[60]">
              Logout
              <span className="absolute right-full top-1/2 -translate-y-1/2
                               border-[5px] border-transparent border-r-gray-900"/>
            </span>
          )}
        </button>
      </div>

      <style>{`
        @keyframes navItemSlide {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0);     }
        }
      `}</style>
    </aside>
  );
};

export default Navbar;