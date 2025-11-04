import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'calm' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'candy';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = {
  calm: {
    name: 'Calm Lavender',
    light: {
      primary: '260 55% 65%',
      secondary: '160 45% 75%',
      accent: '20 70% 80%',
    },
    dark: {
      primary: '260 50% 60%',
      secondary: '160 40% 50%',
      accent: '20 60% 65%',
    }
  },
  ocean: {
    name: 'Ocean Blue',
    light: {
      primary: '200 70% 55%',
      secondary: '180 50% 70%',
      accent: '195 75% 75%',
    },
    dark: {
      primary: '200 65% 50%',
      secondary: '180 45% 55%',
      accent: '195 70% 65%',
    }
  },
  forest: {
    name: 'Forest Green',
    light: {
      primary: '140 50% 50%',
      secondary: '120 45% 65%',
      accent: '80 60% 70%',
    },
    dark: {
      primary: '140 45% 45%',
      secondary: '120 40% 55%',
      accent: '80 55% 60%',
    }
  },
  sunset: {
    name: 'Sunset Orange',
    light: {
      primary: '25 85% 60%',
      secondary: '340 70% 70%',
      accent: '50 80% 75%',
    },
    dark: {
      primary: '25 80% 55%',
      secondary: '340 65% 60%',
      accent: '50 75% 65%',
    }
  },
  midnight: {
    name: 'Midnight Purple',
    light: {
      primary: '280 60% 60%',
      secondary: '260 50% 70%',
      accent: '300 65% 75%',
    },
    dark: {
      primary: '280 55% 55%',
      secondary: '260 45% 60%',
      accent: '300 60% 65%',
    }
  },
  candy: {
    name: 'Candy Pink',
    light: {
      primary: '330 70% 65%',
      secondary: '290 60% 75%',
      accent: '50 75% 80%',
    },
    dark: {
      primary: '330 65% 60%',
      secondary: '290 55% 65%',
      accent: '50 70% 70%',
    }
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as Theme) || 'calm';
  });

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('app-dark-mode');
    return saved === 'true' || false;
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    const root = document.documentElement;
    const colors = themes[theme][isDark ? 'dark' : 'light'];
    
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.accent);
    
    // Update gradients
    root.style.setProperty(
      '--gradient-hero',
      `linear-gradient(135deg, hsl(${colors.primary}), hsl(${colors.secondary}))`
    );
    root.style.setProperty(
      '--gradient-calm',
      `linear-gradient(135deg, hsl(${colors.primary} / 0.1), hsl(${colors.secondary} / 0.1))`
    );
  }, [theme, isDark]);

  useEffect(() => {
    localStorage.setItem('app-dark-mode', isDark.toString());
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleDark = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
