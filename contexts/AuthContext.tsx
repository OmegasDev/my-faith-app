import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  name: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  avatar_url: string | null;
  join_date: string;
  posts_count: number;
  prayers_given: number;
  helpful_guidance: number;
  daily_streak: number;
  can_create_circle: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, username: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateUserStats: (action: 'post' | 'prayer' | 'guidance' | 'comment') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted.current) {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
          // Auto-navigate to app if user is already signed in
          router.replace('/(tabs)');
        } else {
          setLoading(false);
          setInitializing(false);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted.current) {
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
            if (_event === 'SIGNED_IN') {
              router.replace('/(tabs)');
            }
          } else {
            setProfile(null);
            setLoading(false);
            if (_event === 'SIGNED_OUT') {
              router.replace('/login');
            }
          }
          setInitializing(false);
        }
      }
    );

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId) // ✅ this is the correct field
        .single();
  
      if (error) throw error;
      if (mounted.current) setProfile(data);
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
    } finally {
      if (mounted.current) setLoading(false);
    }
        setInitializing(false);
  };
  
  

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting sign in for:', email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.log('❌ Sign in error:', error);
        return { error };
      }

      console.log('✅ Sign in successful');
      return { error };
    } catch (err: any) {
      console.log('⚠️ Sign in crash:', err);
      return { error: err };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    username: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('📥 Signup result:', data);

      if (error) {
        Alert.alert('Signup Failed', error.message);
        return { error };
      }

      if (!data.user) {
        Alert.alert('Signup Error', 'No user returned. Try again or use a different email.');
        return { error: { message: 'No user object returned' } };
      }

      // Give Supabase a second to finalize the user creation
      setTimeout(async () => {
        const newProfile = {
          id: data.user?.id ?? '',
          name,
          username,
          email,
          xp: 0,
          level: 1,
          avatar_url: null,
          join_date: new Date().toISOString(),
          posts_count: 0,
          prayers_given: 0,
          helpful_guidance: 0,
          daily_streak: 0,
          can_create_circle: false,
        };

        const { error: profileError } = await supabase.from('profiles').insert(newProfile);

        if (profileError) {
          console.log('❌ Profile insert error:', profileError);
          Alert.alert('Profile Error', profileError.message);
        } else {
          console.log('✅ Profile created');
        }

        // Optional user preferences
        if (data.user) {
          await supabase.from('user_preferences').insert({
            user_id: data.user.id,
            theme: 'dark',
          });
        }

      }, 1000); // Delay to avoid insert race

      return { error: null };
    } catch (err: any) {
      console.log('❌ Signup crash:', err);
      Alert.alert('Signup Failed', err.message || 'Unexpected error occurred.');
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error && profile && mounted.current) {
      setProfile({ ...profile, ...updates });
    }
  };

  const updateUserStats = async (action: 'post' | 'prayer' | 'guidance' | 'comment') => {
    if (!user || !profile) return;

    let updates: Partial<Profile> = {};
    let xpGain = 0;

    switch (action) {
      case 'post':
        updates.posts_count = (profile.posts_count || 0) + 1;
        xpGain = 10;
        break;
      case 'prayer':
        updates.prayers_given = (profile.prayers_given || 0) + 1;
        xpGain = 5;
        break;
      case 'guidance':
        updates.helpful_guidance = (profile.helpful_guidance || 0) + 1;
        xpGain = 15;
        break;
      case 'comment':
        xpGain = 3;
        break;
    }

    const newXp = (profile.xp || 0) + xpGain;
    const newLevel = Math.floor(newXp / 500) + 1;
    
    updates.xp = newXp;
    updates.level = newLevel;
    
    // Check if user can create circles
    if (newXp >= 1000 && (profile.prayers_given || 0) >= 50 && (profile.helpful_guidance || 0) >= 10) {
      updates.can_create_circle = true;
    }

    await updateProfile(updates);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading: loading || initializing,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updateUserStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


