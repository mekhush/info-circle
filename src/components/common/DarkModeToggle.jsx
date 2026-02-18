// DarkModeToggle.jsx
// A pill-shaped animated toggle showing ☀️ (light) or 🌙 (dark).
// Import this anywhere and drop it in — it reads from ThemeContext.

import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const DarkModeToggle = ({ className = '' }) => {
  const { dark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative flex items-center w-14 h-7 rounded-full p-0.5
                  transition-all duration-300 focus:outline-none focus:ring-2
                  focus:ring-purple-400 focus:ring-offset-2 flex-shrink-0
                  ${dark
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-700 shadow-lg shadow-purple-900/40'
                    : 'bg-gradient-to-r from-amber-300 to-orange-400 shadow-lg shadow-amber-200/60'
                  } ${className}`}
    >
      {/* Sliding knob */}
      <span
        className={`flex items-center justify-center w-6 h-6 rounded-full
                    bg-white shadow-md transition-all duration-300 ease-in-out text-sm
                    ${dark ? 'translate-x-7' : 'translate-x-0'}`}
        aria-hidden="true"
      >
        {dark ? '🌙' : '☀️'}
      </span>
    </button>
  );
};

export default DarkModeToggle;