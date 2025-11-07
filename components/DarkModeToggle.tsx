
import React, { useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SunIcon, MoonIcon } from './Icons';

export const DarkModeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('dark-mode', false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};
