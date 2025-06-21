import { useState, useEffect } from 'react';

interface ThemeSwitcherProps {
  className?: string;
}

const ThemeSwitcher = ({ className = '' }: ThemeSwitcherProps) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [isOpen, setIsOpen] = useState(false);

  const themes = {
    default: {
      name: 'Default',
      primary: '#3b82f6',
      secondary: '#10b981',
      background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    },
    ocean: {
      name: 'Ocean',
      primary: '#0891b2',
      secondary: '#0d9488',
      background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
    },
    sunset: {
      name: 'Sunset',
      primary: '#f97316',
      secondary: '#ec4899',
      background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    },
    forest: {
      name: 'Forest',
      primary: '#059669',
      secondary: '#65a30d',
      background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    },
    royal: {
      name: 'Royal',
      primary: '#7c3aed',
      secondary: '#be185d',
      background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
    },
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('selected-theme') || 'default';
    setCurrentTheme(savedTheme);
    applyCustomTheme(savedTheme);
  }, []);

  const applyCustomTheme = (themeName: string) => {
    const theme = themes[themeName as keyof typeof themes];
    if (!theme) return;

    const root = document.documentElement;
    
    // Apply custom colors
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--background-gradient', theme.background);
    
    // Update body background
    document.body.style.background = theme.background;
    
    // Save to localStorage
    localStorage.setItem('selected-theme', themeName);
  };

  const handleThemeChange = (themeName: string) => {
    setCurrentTheme(themeName);
    applyCustomTheme(themeName);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
      >
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: themes[currentTheme as keyof typeof themes]?.primary }}></div>
        <span className="text-sm font-medium text-gray-700">
          {themes[currentTheme as keyof typeof themes]?.name}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[200px]">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => handleThemeChange(key)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 ${
                currentTheme === key ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: theme.primary }}
              ></div>
              <span className="text-sm font-medium">{theme.name}</span>
              {currentTheme === key && (
                <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher; 