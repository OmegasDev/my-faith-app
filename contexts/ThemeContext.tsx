import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [hasShownThemeModal, setHasShownThemeModal] = useState(false);
  const { user } = useAuth();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    loadStoredTheme();
    
    if (user) {
      loadUserTheme();
      checkShowThemeModal();
    }
    
    return () => {
      mounted.current = false;
    };
  }, [user]);

  const loadStoredTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('theme');
      const hasShown = await AsyncStorage.getItem('hasShownThemeModal');
      
      if (storedTheme && mounted.current) {
        setTheme(storedTheme as 'light' | 'dark');
      }
      
      if (hasShown && mounted.current) {
        setHasShownThemeModal(true);
      }
    } catch (error) {
      console.error('Error loading stored theme:', error);
    }
  };

  const checkShowThemeModal = async () => {
    if (!hasShownThemeModal) {
      const timer = setTimeout(() => {
        if (mounted.current) {
          setShowThemeModal(true);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  };
  const loadUserTheme = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_preferences')
      .select('theme')
      .eq('user_id', user.id)
      .single();

    if (data?.theme && mounted.current) {
      setTheme(data.theme as 'light' | 'dark');
      await AsyncStorage.setItem('theme', data.theme);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    if (mounted.current) {
      setTheme(newTheme);
    }

    // Store theme locally
    await AsyncStorage.setItem('theme', newTheme);
    if (user) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme: newTheme,
        });
    }
  };

  const handleThemeModalClose = async () => {
    setShowThemeModal(false);
    setHasShownThemeModal(true);
    await AsyncStorage.setItem('hasShownThemeModal', 'true');
  };
  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      showThemeModal,
      setShowThemeModal: handleThemeModalClose,
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