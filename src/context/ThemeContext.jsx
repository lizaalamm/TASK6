/**
 * src/context/ThemeContext.jsx
 * ----------------------------------------------------------------------------
 * Light/dark mode state, shared between the theme provider (App.jsx) and the
 * TopBar toggle. Only stores the boolean — the actual MUI theme objects live
 * in `src/assets/theme/brownTheme.js`.
 * ----------------------------------------------------------------------------
 */
import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

/**
 * Provider — receives `{ darkMode, setDarkMode }` from App.jsx state.
 * @param {{children: React.ReactNode, value: {darkMode: boolean, setDarkMode: Function}}} props
 */
export const ThemeContextProvider = ({ children, value }) => {
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Read `{ darkMode, setDarkMode }` anywhere in the tree.
 * @returns {{darkMode: boolean, setDarkMode: Function}}
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeContextProvider');
  }
  return context;
};
