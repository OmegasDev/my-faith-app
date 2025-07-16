import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Modal, TextInput, FlatList, Alert, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Share2, HandHeart, Lightbulb, MoveHorizontal as MoreHorizontal, X, Send, Facebook, Instagram, Twitter } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
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

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
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
  const [showComments, setShowComments] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newComment, setNewComment] = React.useState('');
  const [commentType, setCommentType] = React.useState<'comment' | 'prayer' | 'guidance'>('comment');
  
  const { theme } = useTheme();
  const { user, updateUserStats } = useAuth();
  const isDark = theme === 'dark';
  
  const displayName = post.isAnonymous ? 'Anonymous' : post.author?.name || 'Unknown';

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles!post_comments_user_id_fkey(name, username, avatar_url)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: post.id,
          user_id: user!.id,
          content: newComment.trim(),
          comment_type: commentType,
        });

      if (error) throw error;

      // Update user stats based on comment type
      if (commentType === 'prayer') {
        await updateUserStats('prayer');
      } else if (commentType === 'guidance') {
        await updateUserStats('guidance');
      } else {
        await updateUserStats('comment');
      }

      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleShare = async (platform?: string) => {
    const shareContent = `Check out this ${getPostTypeLabel(post.postType).toLowerCase()} on My Faith: "${post.content}"`;
    
    if (platform) {
      // Handle specific platform sharing
      let url = '';
      switch (platform) {
        case 'facebook':
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareContent)}`;
          break;
        case 'twitter':
          url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareContent)}`;
          break;
        case 'whatsapp':
          url = `https://wa.me/?text=${encodeURIComponent(shareContent)}`;
          break;
      }
      
      if (url) {
        // In a real app, you'd open the URL or use a sharing library
        Alert.alert('Share', `Would open: ${platform}`);
      }
    } else {
      // Use native sharing
      try {
        await Share.share({
          message: shareContent,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
    
    setShowShareModal(false);
    onReaction(post.id, 'share');
  };
  
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
        count: comments.length,
        isActive: false,
        onPress: () => {
          setShowComments(true);
          fetchComments();
        },
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

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={[styles.commentItem, isDark ? styles.darkCommentItem : styles.lightCommentItem]}>
      <View style={styles.commentHeader}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>
            {item.profiles.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.commentInfo}>
          <Text style={[styles.commentName, isDark ? styles.darkText : styles.lightText]}>
            {item.profiles.name}
          </Text>
          <Text style={[styles.commentTime, isDark ? styles.darkSubtext : styles.lightSubtext]}>
            {formatTimeAgo(item.created_at)}
          </Text>
        </View>
      </View>
      <Text style={[styles.commentContent, isDark ? styles.darkText : styles.lightText]}>
        {item.content}
      </Text>
    </View>
  );

  const renderCommentsModal = () => (
    <Modal
      visible={showComments}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowComments(false)}
    >
      <View style={[styles.modalContainer, isDark ? styles.darkContainer : styles.lightContainer]}>
        <View style={[styles.modalHeader, isDark ? styles.darkHeader : styles.lightHeader]}>
          <TouchableOpacity onPress={() => setShowComments(false)}>
            <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, isDark ? styles.darkText : styles.lightText]}>
            Comments
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          style={styles.commentsList}
          contentContainerStyle={styles.commentsContent}
          ListEmptyComponent={
            <View style={styles.emptyComments}>
              <MessageCircle size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
              <Text style={[styles.emptyTitle, isDark ? styles.darkText : styles.lightText]}>
                No comments yet
              </Text>
              <Text style={[styles.emptyDescription, isDark ? styles.darkSubtext : styles.lightSubtext]}>
                Be the first to comment on this post
              </Text>
            </View>
          }
        />

        <View style={[styles.commentInput, isDark ? styles.darkCommentInput : styles.lightCommentInput]}>
          <View style={styles.commentTypeSelector}>
            {(['comment', 'prayer', 'guidance'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.commentTypeButton,
                  commentType === type && styles.selectedCommentType,
                ]}
                onPress={() => setCommentType(type)}
              >
                <Text style={[
                  styles.commentTypeText,
                  commentType === type && styles.selectedCommentTypeText,
                ]}>
                  {type === 'comment' ? '💬' : type === 'prayer' ? '🙏' : '💡'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.commentInputRow}>
            <TextInput
              style={[styles.commentTextInput, isDark ? styles.darkText : styles.lightText]}
              placeholder={`Add a ${commentType}...`}
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity
              style={[styles.commentSendButton, !newComment.trim() && styles.disabledSendButton]}
              onPress={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Send size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderShareModal = () => (
    <Modal
      visible={showShareModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowShareModal(false)}
    >
      <View style={styles.shareOverlay}>
        <View style={[styles.shareModal, isDark ? styles.darkCard : styles.lightCard]}>
          <Text style={[styles.shareTitle, isDark ? styles.darkText : styles.lightText]}>
            Share this post
          </Text>
          
          <View style={styles.shareOptions}>
            <TouchableOpacity
              style={styles.shareOption}
              onPress={() => handleShare('facebook')}
            >
              <View style={[styles.shareIcon, { backgroundColor: '#1877F2' }]}>
                <Facebook size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.shareOptionText, isDark ? styles.darkText : styles.lightText]}>
                Facebook
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.shareOption}
              onPress={() => handleShare('twitter')}
            >
              <View style={[styles.shareIcon, { backgroundColor: '#1DA1F2' }]}>
                <Twitter size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.shareOptionText, isDark ? styles.darkText : styles.lightText]}>
                Twitter
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.shareOption}
              onPress={() => handleShare('whatsapp')}
            >
              <View style={[styles.shareIcon, { backgroundColor: '#25D366' }]}>
                <MessageCircle size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.shareOptionText, isDark ? styles.darkText : styles.lightText]}>
                WhatsApp
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.shareOption}
              onPress={() => handleShare()}
            >
              <View style={[styles.shareIcon, { backgroundColor: '#667eea' }]}>
                <Share2 size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.shareOptionText, isDark ? styles.darkText : styles.lightText]}>
                More
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.shareCancel}
            onPress={() => setShowShareModal(false)}
          >
            <Text style={[styles.shareCancelText, isDark ? styles.darkSubtext : styles.lightSubtext]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
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
              onPress={reaction.label === 'Share' ? () => setShowShareModal(true) : reaction.onPress}
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
    
    {renderCommentsModal()}
    {renderShareModal()}
    </>
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    padding: 16,
  },
  commentItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  lightCommentItem: {
    backgroundColor: '#F9FAFB',
  },
  darkCommentItem: {
    backgroundColor: '#374151',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  commentAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  commentInfo: {
    flex: 1,
  },
  commentName: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentTime: {
    fontSize: 12,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  commentInput: {
    padding: 16,
    borderTopWidth: 1,
  },
  lightCommentInput: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
  },
  darkCommentInput: {
    backgroundColor: '#1F2937',
    borderTopColor: '#374151',
  },
  commentTypeSelector: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  commentTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  selectedCommentType: {
    backgroundColor: '#667eea',
  },
  commentTypeText: {
    fontSize: 16,
  },
  selectedCommentTypeText: {
    color: '#FFFFFF',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  commentTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  commentSendButton: {
    backgroundColor: '#667eea',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    opacity: 0.5,
  },
  shareOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  shareModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  shareOption: {
    alignItems: 'center',
    gap: 8,
  },
  shareIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  shareCancel: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  shareCancelText: {
    fontSize: 16,
  },
});