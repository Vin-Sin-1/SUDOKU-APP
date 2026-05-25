import { createContext, useContext, useState } from 'react';
import themes from '../constants/themes.js';

const ThemeContext = createContext({ theme: themes.classic, themeId: 'classic', changeTheme: () => {}, themes });

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => localStorage.getItem('sudoku-theme') || 'classic');
  const theme = themes[themeId] || themes.classic;

  function changeTheme(id) {
    setThemeId(id);
    localStorage.setItem('sudoku-theme', id);
  }

  return (
    <ThemeContext.Provider value={{ theme, themeId, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
