/*
  # Initial Schema for My Faith App

  1. New Tables
    - `profiles` - User profiles with XP and stats
    - `posts` - All user posts with type and reactions
    - `post_reactions` - User reactions to posts
    - `faith_circles` - Community groups/circles
    - `circle_members` - Circle membership
    - `circle_messages` - Messages within circles
    - `direct_messages` - Private messages between users
    - `user_preferences` - User settings like theme preference

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper access control for private data

  3. Features
    - XP system for user progression
    - Anonymous posting for confessions
    - Faith circles with messaging
    - Direct messaging system
    - Theme preferences
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  name text NOT NULL,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  avatar_url text,
  join_date timestamptz DEFAULT now(),
  posts_count integer DEFAULT 0,
  prayers_given integer DEFAULT 0,
  helpful_guidance integer DEFAULT 0,
  daily_streak integer DEFAULT 0,
  can_create_circle boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  theme text DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  notifications_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  post_type text NOT NULL CHECK (post_type IN ('confession', 'prayer', 'guidance', 'testimony', 'normal')),
  is_anonymous boolean DEFAULT false,
  background_type text DEFAULT 'color' CHECK (background_type IN ('color', 'gradient')),
  background_value text DEFAULT '#E8F4FD',
  background_colors text[], -- For gradients
  likes_count integer DEFAULT 0,
  prayers_count integer DEFAULT 0,
  guides_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Post reactions table
CREATE TABLE IF NOT EXISTS post_reactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'pray', 'guide', 'share')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Faith circles table
CREATE TABLE IF NOT EXISTS faith_circles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  avatar_url text,
  is_private boolean DEFAULT true,
  member_count integer DEFAULT 0,
  created_by uuid REFERENCES profiles(id),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Circle members table
CREATE TABLE IF NOT EXISTS circle_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  circle_id uuid REFERENCES faith_circles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

-- Circle messages table
CREATE TABLE IF NOT EXISTS circle_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  circle_id uuid REFERENCES faith_circles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  created_at timestamptz DEFAULT now()
);

-- Direct messages table
CREATE TABLE IF NOT EXISTS direct_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE faith_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Posts policies
CREATE POLICY "Users can view all posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Post reactions policies
CREATE POLICY "Users can view all reactions"
  ON post_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own reactions"
  ON post_reactions FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Faith circles policies
CREATE POLICY "Users can view all circles"
  ON faith_circles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create circles if allowed"
  ON faith_circles FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND can_create_circle = true
    )
  );

CREATE POLICY "Circle creators can update their circles"
  ON faith_circles FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Circle members policies
CREATE POLICY "Users can view circle members"
  ON circle_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join circles"
  ON circle_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave circles"
  ON circle_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Circle messages policies
CREATE POLICY "Circle members can view messages"
  ON circle_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM circle_members 
      WHERE circle_id = circle_messages.circle_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Circle members can send messages"
  ON circle_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM circle_members 
      WHERE circle_id = circle_messages.circle_id 
      AND user_id = auth.uid()
    )
  );

-- Direct messages policies
CREATE POLICY "Users can view their messages"
  ON direct_messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON direct_messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their received messages"
  ON direct_messages FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid());

-- Insert default faith circles
INSERT INTO faith_circles (name, description, is_default, member_count) VALUES
('New Believers Circle', 'A welcoming community for those new to faith or returning after time away', true, 0),
('Prayer Warriors', 'Dedicated to intercession and prayer support for our community', true, 0),
('Bible Study Central', 'Deep dive into Scripture with guided discussions and study materials', true, 0),
('Youth Faith', 'A vibrant community for young believers to grow together', true, 0),
('Marriage & Family', 'Support and guidance for Christian marriages and families', true, 0),
('Testimony & Praise', 'Share your victories and celebrate God''s goodness together', true, 0);

-- Functions to update counters
CREATE OR REPLACE FUNCTION update_post_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET
      likes_count = CASE WHEN NEW.reaction_type = 'like' THEN likes_count + 1 ELSE likes_count END,
      prayers_count = CASE WHEN NEW.reaction_type = 'pray' THEN prayers_count + 1 ELSE prayers_count END,
      guides_count = CASE WHEN NEW.reaction_type = 'guide' THEN guides_count + 1 ELSE guides_count END,
      shares_count = CASE WHEN NEW.reaction_type = 'share' THEN shares_count + 1 ELSE shares_count END
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET
      likes_count = CASE WHEN OLD.reaction_type = 'like' THEN likes_count - 1 ELSE likes_count END,
      prayers_count = CASE WHEN OLD.reaction_type = 'pray' THEN prayers_count - 1 ELSE prayers_count END,
      guides_count = CASE WHEN OLD.reaction_type = 'guide' THEN guides_count - 1 ELSE guides_count END,
      shares_count = CASE WHEN OLD.reaction_type = 'share' THEN shares_count - 1 ELSE shares_count END
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_reaction_counts_trigger
  AFTER INSERT OR DELETE ON post_reactions
  FOR EACH ROW EXECUTE FUNCTION update_post_reaction_counts();

-- Function to update circle member counts
CREATE OR REPLACE FUNCTION update_circle_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE faith_circles SET member_count = member_count + 1 WHERE id = NEW.circle_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE faith_circles SET member_count = member_count - 1 WHERE id = OLD.circle_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER circle_member_count_trigger
  AFTER INSERT OR DELETE ON circle_members
  FOR EACH ROW EXECUTE FUNCTION update_circle_member_count();