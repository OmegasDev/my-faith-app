import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, RefreshControl, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Search, Sparkles, TrendingUp, Heart, MessageCircle } from 'lucide-react-native';
import FeedPostCard from '../../components/FeedPostCard';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState(0);
  const scrollY = new Animated.Value(0);
  const { user, profile } = useAuth();
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

  const renderHeader = () => {
    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0.9],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={isDark ? ['#1F2937', '#111827'] : ['#FFFFFF', '#F8FAFC']}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Image 
                source={require('../../assets/images/Leonardo_Phoenix_10_Create_a_captivating_brand_logo_for_a_soci_3.jpg')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <View>
                <Text style={[styles.greeting, isDark ? styles.darkText : styles.lightText]}>
                  Welcome back
                </Text>
                <Text style={[styles.userName, isDark ? styles.darkText : styles.lightText]}>
                  {profile?.name || 'Friend'}
                </Text>
              </View>
            </View>
            
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={[styles.iconButton, isDark ? styles.darkIconButton : styles.lightIconButton]}
                onPress={() => router.push('/notifications')}
              >
                <Bell size={20} color={isDark ? '#FFFFFF' : '#1F2937'} />
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.iconButton, isDark ? styles.darkIconButton : styles.lightIconButton]}
              >
                <Search size={20} color={isDark ? '#FFFFFF' : '#1F2937'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stories Section */}
          <View style={styles.storiesSection}>
            <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
              Faith Stories
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[
                { id: '1', name: 'Your Story', isOwn: true },
                { id: '2', name: 'Grace', color: '#8B5CF6' },
                { id: '3', name: 'David', color: '#10B981' },
                { id: '4', name: 'Sarah', color: '#F59E0B' },
                { id: '5', name: 'John', color: '#EF4444' },
              ]}
              renderItem={({ item, index }) => (
                <TouchableOpacity 
                  style={[
                    styles.storyItem,
                    activeStory === index && styles.activeStory
                  ]}
                  onPress={() => setActiveStory(index)}
                >
                  {item.isOwn ? (
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.storyAvatar}
                    >
                      <Text style={styles.storyText}>+</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.storyAvatar, { backgroundColor: item.color }]}>
                      <Text style={styles.storyText}>{item.name.charAt(0)}</Text>
                    </View>
                  )}
                  <Text style={[styles.storyName, isDark ? styles.darkSubtext : styles.lightSubtext]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.storiesContainer}
            />
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={[styles.statCard, isDark ? styles.darkStatCard : styles.lightStatCard]}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={[styles.statText, isDark ? styles.darkText : styles.lightText]}>
                Level {profile?.level || 1}
              </Text>
            </View>
            
            <View style={[styles.statCard, isDark ? styles.darkStatCard : styles.lightStatCard]}>
              <Heart size={16} color="#EF4444" />
              <Text style={[styles.statText, isDark ? styles.darkText : styles.lightText]}>
                {profile?.prayers_given || 0} Prayers
              </Text>
            </View>
            
            <View style={[styles.statCard, isDark ? styles.darkStatCard : styles.lightStatCard]}>
              <Sparkles size={16} color="#F59E0B" />
              <Text style={[styles.statText, isDark ? styles.darkText : styles.lightText]}>
                {profile?.xp || 0} XP
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderPost = ({ item, index }: { item: any; index: number }) => {
    const inputRange = [-1, 0, 200 * index, 200 * (index + 2)];
    const opacityInputRange = [-1, 0, 200 * index, 200 * (index + 0.5)];
    
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.8],
      extrapolate: 'clamp',
    });
    
    const opacity = scrollY.interpolate({
      inputRange: opacityInputRange,
      outputRange: [1, 1, 1, 0.3],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[{ transform: [{ scale }], opacity }]}>
        <FeedPostCard post={item} onReaction={handleReaction} />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
      <Animated.FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchPosts}
            tintColor={isDark ? '#FFFFFF' : '#000000'}
            progressBackgroundColor={isDark ? '#374151' : '#FFFFFF'}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.feedContent}
      />
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
  headerContainer: {
    marginBottom: 16,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  greeting: {
    fontSize: 14,
    opacity: 0.7,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lightIconButton: {
    backgroundColor: '#F3F4F6',
  },
  darkIconButton: {
    backgroundColor: '#374151',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  storiesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  storiesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  storyItem: {
    alignItems: 'center',
    width: 70,
  },
  storyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeStory: {
    transform: [{ scale: 1.1 }],
  },
  storyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  storyName: {
    fontSize: 12,
    textAlign: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  lightStatCard: {
    backgroundColor: '#FFFFFF',
  },
  darkStatCard: {
    backgroundColor: '#374151',
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
  feedContent: {
    paddingBottom: 100,
  },
  darkText: {
    color: '#FFFFFF',
  },
  lightText: {
    color: '#1F2937',
  },
  darkSubtext: {
    color: '#9CA3AF',
  },
  lightSubtext: {
    color: '#6B7280',
  },
});