import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.log('Please check your .env file and make sure you have:');
  console.log('EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  throw new Error('Supabase environment variables are not configured');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          username: string;
          email: string;
          xp?: number;
          level?: number;
          avatar_url?: string | null;
          join_date?: string;
          posts_count?: number;
          prayers_given?: number;
          helpful_guidance?: number;
          daily_streak?: number;
          can_create_circle?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          username?: string;
          email?: string;
          xp?: number;
          level?: number;
          avatar_url?: string | null;
          join_date?: string;
          posts_count?: number;
          prayers_given?: number;
          helpful_guidance?: number;
          daily_streak?: number;
          can_create_circle?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          post_type: 'confession' | 'prayer' | 'guidance' | 'testimony' | 'normal';
          is_anonymous: boolean;
          background_type: 'color' | 'gradient';
          background_value: string;
          background_colors: string[] | null;
          likes_count: number;
          prayers_count: number;
          guides_count: number;
          shares_count: number;
          comments_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          post_type: 'confession' | 'prayer' | 'guidance' | 'testimony' | 'normal';
          is_anonymous?: boolean;
          background_type?: 'color' | 'gradient';
          background_value?: string;
          background_colors?: string[] | null;
          likes_count?: number;
          prayers_count?: number;
          guides_count?: number;
          shares_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          post_type?: 'confession' | 'prayer' | 'guidance' | 'testimony' | 'normal';
          is_anonymous?: boolean;
          background_type?: 'color' | 'gradient';
          background_value?: string;
          background_colors?: string[] | null;
          likes_count?: number;
          prayers_count?: number;
          guides_count?: number;
          shares_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      faith_circles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          avatar_url: string | null;
          is_private: boolean;
          member_count: number;
          created_by: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          avatar_url?: string | null;
          is_private?: boolean;
          member_count?: number;
          created_by?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          avatar_url?: string | null;
          is_private?: boolean;
          member_count?: number;
          created_by?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};