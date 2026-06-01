import React, { createContext, useContext, useState, useEffect } from 'react';

const LiteModeContext = createContext();

export const LiteModeProvider = ({ children }) => {
  const [isLiteMode, setIsLiteMode] = useState(() => {
    const saved = localStorage.getItem('liteMode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('liteMode', isLiteMode);
    // Toggle a CSS class on document body for global styling
    if (isLiteMode) {
      document.body.classList.add('lite-mode');
    } else {
      document.body.classList.remove('lite-mode');
    }
  }, [isLiteMode]);

  const toggleLiteMode = () => setIsLiteMode(prev => !prev);

  return (
    <LiteModeContext.Provider value={{ isLiteMode, toggleLiteMode }}>
      {children}
    </LiteModeContext.Provider>
  );
};

export const useLiteMode = () => {
  const context = useContext(LiteModeContext);
  if (!context) {
    throw new Error('useLiteMode must be used within a LiteModeProvider');
  }
  return context;
};

export default LiteModeContext;
