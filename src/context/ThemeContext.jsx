import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeContextProvider = ({ children, value }) => {
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeContextProvider');
  }
  return context;
};