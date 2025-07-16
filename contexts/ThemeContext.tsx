import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  showThemeModal: boolean;
  setShowThemeModal: (show: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const { user } = useAuth();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    
    if (user) {
      loadUserTheme();
      // Show theme modal after 5 seconds
      const timer = setTimeout(() => {
        if (mounted.current) {
          setShowThemeModal(true);
        }
      }, 5000);
      return () => {
        clearTimeout(timer);
      };
    }
    
    return () => {
      mounted.current = false;
    };
  }, [user]);

  const loadUserTheme = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_preferences')
      .select('theme')
      .eq('user_id', user.id)
      .single();

    if (data?.theme && mounted.current) {
      setTheme(data.theme as 'light' | 'dark');
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    if (mounted.current) {
      setTheme(newTheme);
    }

    if (user) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme: newTheme,
        });
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      showThemeModal,
      setShowThemeModal,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};