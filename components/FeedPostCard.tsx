import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Share2, HandHeart, Lightbulb, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { formatTimeAgo } from '../utils/xpCalculator';

interface Post {
  id: string;
  userId: string;
  content: string;
  postType: 'confession' | 'prayer' | 'guidance' | 'testimony' | 'normal';
  isAnonymous: boolean;
  background: {
    type: 'color' | 'gradient';
    value: string;
    colors?: string[];
  };
  timestamp: string;
  reactions: {
    likes: number;
    prayers: number;
    guides: number;
    shares: number;
    userReactions: {
      liked: boolean;
      prayed: boolean;
      guided: boolean;
      shared: boolean;
    };
  };
  author?: {
    name: string;
    username: string;
    avatar_url: string | null;
  };
}

interface FeedPostCardProps {
  post: Post;
  onReaction: (postId: string, reaction: string) => void;
}

const getPostTypeColor = (type: string): string => {
  switch (type) {
    case 'confession': return '#EF4444';
    case 'prayer': return '#8B5CF6';
    case 'guidance': return '#F59E0B';
    case 'testimony': return '#10B981';
    case 'normal': return '#3B82F6';
    default: return '#6B7280';
  }
};

const getPostTypeLabel = (type: string): string => {
  switch (type) {
    case 'confession': return 'Confession';
    case 'prayer': return 'Prayer Request';
    case 'guidance': return 'Guidance Request';
    case 'testimony': return 'Testimony';
    case 'normal': return 'Post';
    default: return 'Post';
  }
};

const { width: screenWidth } = Dimensions.get('window');
const postWidth = screenWidth - 32; // 16px margin on each side

export default function FeedPostCard({ post, onReaction }: FeedPostCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const displayName = post.isAnonymous ? 'Anonymous' : post.author?.name || 'Unknown';
  
  const renderBackground = () => {
    if (post.background.type === 'gradient' && post.background.colors) {
      return (
        <LinearGradient
          colors={post.background.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.postBackground}
        />
      );
    }
    return <View style={[styles.postBackground, { backgroundColor: post.background.value }]} />;
  };

  const getAvailableReactions = () => {
    const reactions = [];
    
    // Like is always available
    reactions.push({
      icon: <Heart size={18} color={post.reactions.userReactions.liked ? '#EF4444' : '#65676B'} fill={post.reactions.userReactions.liked ? '#EF4444' : 'none'} />,
      count: post.reactions.likes,
      isActive: post.reactions.userReactions.liked,
      onPress: () => onReaction(post.id, 'like'),
      label: 'Like'
    });

    // Comment not available for confessions
    if (post.postType !== 'confession') {
      reactions.push({
        icon: <MessageCircle size={18} color="#65676B" />,
        count: 0,
        isActive: false,
        onPress: () => {},
        label: 'Comment'
      });
    }

    // Share available for all but limited for confessions
    reactions.push({
      icon: <Share2 size={18} color={post.reactions.userReactions.shared ? '#1877F2' : '#65676B'} />,
      count: post.reactions.shares,
      isActive: post.reactions.userReactions.shared,
      onPress: () => onReaction(post.id, 'share'),
      label: 'Share'
    });

    // Pray available for prayer, confession, guidance
    if (['prayer', 'confession', 'guidance'].includes(post.postType)) {
      reactions.push({
        icon: <HandHeart size={18} color={post.reactions.userReactions.prayed ? '#8B5CF6' : '#65676B'} fill={post.reactions.userReactions.prayed ? '#8B5CF6' : 'none'} />,
        count: post.reactions.prayers,
        isActive: post.reactions.userReactions.prayed,
        onPress: () => onReaction(post.id, 'pray'),
        label: 'Pray'
      });
    }

    // Guide available for guidance and confession
    if (['guidance', 'confession'].includes(post.postType)) {
      reactions.push({
        icon: <Lightbulb size={18} color={post.reactions.userReactions.guided ? '#F59E0B' : '#65676B'} fill={post.reactions.userReactions.guided ? '#F59E0B' : 'none'} />,
        count: post.reactions.guides,
        isActive: post.reactions.userReactions.guided,
        onPress: () => onReaction(post.id, 'guide'),
        label: 'Guide'
      });
    }

    return reactions;
  };

  return (
    <View style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0)}</Text>
          </View>
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, isDark ? styles.darkText : styles.lightText]}>
                {displayName}
              </Text>
              <View style={[styles.postTypeTag, { backgroundColor: getPostTypeColor(post.postType) }]}>
                <Text style={styles.postTypeText}>{getPostTypeLabel(post.postType)}</Text>
              </View>
            </View>
            <Text style={[styles.timestamp, isDark ? styles.darkSubtext : styles.lightSubtext]}>
              {formatTimeAgo(post.timestamp)}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={20} color={isDark ? '#9CA3AF' : '#65676B'} />
        </TouchableOpacity>
      </View>

      {/* Post Content - Styled like screenshot */}
      <View style={styles.postContainer}>
        {renderBackground()}
        <View style={styles.contentWrapper}>
          <Text style={styles.postContent}>{post.content}</Text>
        </View>
      </View>

      {/* Reactions */}
      <View style={styles.reactionsContainer}>
        <View style={styles.reactionCounts}>
          {post.reactions.likes > 0 && (
            <View style={styles.reactionCount}>
              <View style={styles.reactionIcon}>
                <Heart size={12} color="#FFFFFF" fill="#EF4444" />
              </View>
              <Text style={styles.countText}>{post.reactions.likes}</Text>
            </View>
          )}
          {post.reactions.prayers > 0 && (
            <View style={styles.reactionCount}>
              <View style={[styles.reactionIcon, { backgroundColor: '#8B5CF6' }]}>
                <HandHeart size={12} color="#FFFFFF" fill="#FFFFFF" />
              </View>
              <Text style={styles.countText}>{post.reactions.prayers}</Text>
            </View>
          )}
          {post.reactions.guides > 0 && (
            <View style={styles.reactionCount}>
              <View style={[styles.reactionIcon, { backgroundColor: '#F59E0B' }]}>
                <Lightbulb size={12} color="#FFFFFF" fill="#FFFFFF" />
              </View>
              <Text style={styles.countText}>{post.reactions.guides}</Text>
            </View>
          )}
        </View>
        
        <View style={[styles.separator, isDark ? styles.darkSeparator : styles.lightSeparator]} />
        
        <View style={styles.actionButtons}>
          {getAvailableReactions().map((reaction, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionButton}
              onPress={reaction.onPress}
            >
              {reaction.icon}
              <Text style={[styles.actionText, reaction.isActive && styles.activeActionText]}>
                {reaction.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: postWidth,
    alignSelf: 'center',
  },
  lightContainer: {
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1877F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  postTypeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  postTypeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 13,
  },
  moreButton: {
    padding: 8,
  },
  postContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 200,
    maxHeight: 400,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    width: '100%',
  },
  postContent: {
    fontSize: 20,
    lineHeight: 28,
    color: '#1C1E21',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
    maxWidth: '90%',
  },
  reactionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  reactionCounts: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 20,
  },
  reactionCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  reactionIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  countText: {
    fontSize: 13,
    fontWeight: '400',
  },
  separator: {
    height: 1,
    marginBottom: 8,
  },
  lightSeparator: {
    backgroundColor: '#E4E6EA',
  },
  darkSeparator: {
    backgroundColor: '#374151',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 15,
    marginLeft: 6,
    fontWeight: '600',
  },
  activeActionText: {
    color: '#1877F2',
  },
  darkText: {
    color: '#FFFFFF',
  },
  lightText: {
    color: '#050505',
  },
  darkSubtext: {
    color: '#9CA3AF',
  },
  lightSubtext: {
    color: '#65676B',
  },
});