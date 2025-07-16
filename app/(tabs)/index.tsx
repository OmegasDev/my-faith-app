import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeedPostCard from '../../components/FeedPostCard';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { useEffect } from 'react';

export default function HomeScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey(name, username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Get user reactions for each post
      const { data: reactions, error: reactionsError } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('user_id', user!.id);

      if (reactionsError) throw reactionsError;

      // Transform data to match component expectations
      const transformedPosts = postsData.map(post => {
        const userReactions = reactions.filter(r => r.post_id === post.id);
        
        return {
          id: post.id,
          userId: post.user_id,
          content: post.content,
          postType: post.post_type,
          isAnonymous: post.is_anonymous,
          background: {
            type: post.background_type,
            value: post.background_value,
            colors: post.background_colors,
          },
          timestamp: post.created_at,
          reactions: {
            likes: post.likes_count,
            prayers: post.prayers_count,
            guides: post.guides_count,
            shares: post.shares_count,
            userReactions: {
              liked: userReactions.some(r => r.reaction_type === 'like'),
              prayed: userReactions.some(r => r.reaction_type === 'pray'),
              guided: userReactions.some(r => r.reaction_type === 'guide'),
              shared: userReactions.some(r => r.reaction_type === 'share'),
            },
          },
          author: post.profiles,
        };
      });

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (postId: string, reaction: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const isCurrentlyReacted = post.reactions.userReactions[reaction === 'like' ? 'liked' : 
                                                            reaction === 'pray' ? 'prayed' :
                                                            reaction === 'guide' ? 'guided' : 'shared'];

      if (isCurrentlyReacted) {
        // Remove reaction
        await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user!.id)
          .eq('reaction_type', reaction);
      } else {
        // Add reaction
        await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user!.id,
            reaction_type: reaction,
          });
      }

      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            const newPost = { ...post };
            const userReactions = { ...newPost.reactions.userReactions };
            
            switch (reaction) {
              case 'like':
                userReactions.liked = !userReactions.liked;
                newPost.reactions.likes += userReactions.liked ? 1 : -1;
                break;
              case 'pray':
                userReactions.prayed = !userReactions.prayed;
                newPost.reactions.prayers += userReactions.prayed ? 1 : -1;
                break;
              case 'guide':
                userReactions.guided = !userReactions.guided;
                newPost.reactions.guides += userReactions.guided ? 1 : -1;
                break;
              case 'share':
                userReactions.shared = !userReactions.shared;
                newPost.reactions.shares += userReactions.shared ? 1 : -1;
                break;
            }
            
            newPost.reactions.userReactions = userReactions;
            return newPost;
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
      <View style={[styles.header, isDark ? styles.darkHeader : styles.lightHeader]}>
        <Image 
          source={require('../../assets/images/Leonardo_Phoenix_10_Create_a_captivating_brand_logo_for_a_soci_3.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.headerTitle, isDark ? styles.darkText : { color: '#1877F2' }]}>
          My Faith
        </Text>
      </View>

      <ScrollView 
        style={styles.feed}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchPosts}
            tintColor={isDark ? '#FFFFFF' : '#000000'}
          />
        }
      >
        {posts.map((post) => (
          <FeedPostCard key={post.id} post={post} onReaction={handleReaction} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#F0F2F5',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  lightHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E4E6EA',
  },
  darkHeader: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingVertical: 8,
  },
  darkText: {
    color: '#FFFFFF',
  },
});