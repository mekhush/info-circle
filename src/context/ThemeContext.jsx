// ThemeContext.jsx
// Provides dark/light mode toggle AND admin theme to the entire app.
// Persists theme preference in localStorage.
// Applies/removes the "dark" class on <html> — Tailwind reads this.
// Applies/removes the "admin" class on <html> — triggers admin gold theme.

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isAdminMode, setIsAdminMode] = useState(false);

  // Sync dark class + localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  // Sync admin class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isAdminMode) {
      root.classList.add('admin');
    } else {
      root.classList.remove('admin');
    }
  }, [isAdminMode]);

  const toggle = () => setDark(v => !v);
  const setAdminTheme = (active) => setIsAdminMode(active);

  return (
    <ThemeContext.Provider value={{ dark, toggle, isAdminMode, setAdminTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};






















// // ThemeContext.jsx
// // Provides dark/light mode toggle to the entire app.
// // Persists preference in localStorage.
// // Applies/removes the "dark" class on <html> — Tailwind reads this.

// import React, { createContext, useContext, useEffect, useState } from 'react';

// const ThemeContext = createContext(null);

// export const ThemeProvider = ({ children }) => {
//   const [dark, setDark] = useState(() => {
//     // 1. Check localStorage first
//     const saved = localStorage.getItem('theme');
//     if (saved) return saved === 'dark';
//     // 2. Respect OS preference
//     return window.matchMedia('(prefers-color-scheme: dark)').matches;
//   });

//   // Keep <html> class and localStorage in sync whenever `dark` changes
//   useEffect(() => {
//     const root = document.documentElement;
//     if (dark) {
//       root.classList.add('dark');
//       localStorage.setItem('theme', 'dark');
//     } else {
//       root.classList.remove('dark');
//       localStorage.setItem('theme', 'light');
//     }
//   }, [dark]);

//   const toggle = () => setDark(v => !v);

//   return (
//     <ThemeContext.Provider value={{ dark, toggle }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => {
//   const ctx = useContext(ThemeContext);
//   if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
//   return ctx;
// };