import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Palette } from 'lucide-react-native';
import { PostType, PostBackground } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const { width } = Dimensions.get('window');

const postBackgrounds: PostBackground[] = [
  { type: 'color', value: '#E8F4FD' },
  { type: 'color', value: '#FFF7ED' },
  { type: 'color', value: '#F0FDF4' },
  { type: 'color', value: '#FEF3F2' },
  { type: 'color', value: '#F3F4F6' },
  { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', colors: ['#667eea', '#764ba2'] },
  { type: 'gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', colors: ['#f093fb', '#f5576c'] },
  { type: 'gradient', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', colors: ['#4facfe', '#00f2fe'] },
  { type: 'gradient', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', colors: ['#43e97b', '#38f9d7'] },
  { type: 'gradient', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', colors: ['#fa709a', '#fee140'] },
];

export default function CreatePostModal({ visible, onClose, onSubmit }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('normal');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<PostBackground>(postBackgrounds[0]);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { theme } = useTheme();

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a post');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          post_type: postType,
          is_anonymous: isAnonymous,
          background_type: selectedBackground.type,
          background_value: selectedBackground.value,
          background_colors: selectedBackground.colors || null,
        });

      if (error) throw error;

      // Reset form
      setContent('');
      setPostType('normal');
      setIsAnonymous(false);
      setSelectedBackground(postBackgrounds[0]);
      
      onSubmit();
      onClose();
      
      Alert.alert('Success', 'Your post has been created!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderBackground = (bg: PostBackground, isSelected: boolean) => {
    if (bg.type === 'gradient' && bg.colors) {
      return (
        <LinearGradient
          colors={bg.colors}
          style={[styles.backgroundOption, isSelected && styles.selectedBackground]}
        />
      );
    }
    return (
      <View
        style={[
          styles.backgroundOption,
          { backgroundColor: bg.value },
          isSelected && styles.selectedBackground,
        ]}
      />
    );
  };

  const isDark = theme === 'dark';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
        <View style={[styles.header, isDark ? styles.darkHeader : styles.lightHeader]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark ? styles.darkText : styles.lightText]}>
            Create Post
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !content.trim()}
            style={[
              styles.submitButton,
              (!content.trim() || loading) && styles.disabledButton,
            ]}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Post Type Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
              Post Type
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.postTypes}>
              {(['normal', 'prayer', 'testimony', 'guidance', 'confession'] as PostType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.postTypeButton,
                    postType === type && styles.selectedPostType,
                    isDark ? styles.darkButton : styles.lightButton,
                  ]}
                  onPress={() => {
                    setPostType(type);
                    setIsAnonymous(type === 'confession');
                  }}
                >
                  <Text style={[
                    styles.postTypeText,
                    postType === type && styles.selectedPostTypeText,
                    isDark ? styles.darkText : styles.lightText,
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Anonymous Toggle */}
          <View style={styles.section}>
            <View style={styles.anonymousRow}>
              <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
                Post Anonymously
              </Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  isAnonymous && styles.toggleActive,
                  isDark ? styles.darkToggle : styles.lightToggle,
                ]}
                onPress={() => setIsAnonymous(!isAnonymous)}
                disabled={postType === 'confession'}
              >
                <View style={[
                  styles.toggleThumb,
                  isAnonymous && styles.toggleThumbActive,
                ]} />
              </TouchableOpacity>
            </View>
            {postType === 'confession' && (
              <Text style={[styles.helperText, isDark ? styles.darkSubtext : styles.lightSubtext]}>
                Confessions are always anonymous
              </Text>
            )}
          </View>

          {/* Background Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
              <Palette size={16} color={isDark ? '#FFFFFF' : '#000000'} /> Background
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.backgrounds}>
              {postBackgrounds.map((bg, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedBackground(bg)}
                  style={styles.backgroundContainer}
                >
                  {renderBackground(bg, selectedBackground === bg)}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Content Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
              Content
            </Text>
            <View style={styles.contentPreview}>
              {selectedBackground.type === 'gradient' && selectedBackground.colors ? (
                <LinearGradient
                  colors={selectedBackground.colors}
                  style={styles.previewBackground}
                >
                  <TextInput
                    style={styles.contentInput}
                    placeholder="Share your heart..."
                    placeholderTextColor="rgba(0,0,0,0.5)"
                    value={content}
                    onChangeText={setContent}
                    multiline
                    textAlignVertical="center"
                  />
                </LinearGradient>
              ) : (
                <View style={[styles.previewBackground, { backgroundColor: selectedBackground.value }]}>
                  <TextInput
                    style={styles.contentInput}
                    placeholder="Share your heart..."
                    placeholderTextColor="rgba(0,0,0,0.5)"
                    value={content}
                    onChangeText={setContent}
                    multiline
                    textAlignVertical="center"
                  />
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  lightHeader: {
    borderBottomColor: '#E5E7EB',
  },
  darkHeader: {
    borderBottomColor: '#374151',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  postTypes: {
    flexDirection: 'row',
  },
  postTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  lightButton: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  darkButton: {
    borderColor: '#374151',
    backgroundColor: '#374151',
  },
  selectedPostType: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  postTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedPostTypeText: {
    color: '#FFFFFF',
  },
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  lightToggle: {
    backgroundColor: '#E5E7EB',
  },
  darkToggle: {
    backgroundColor: '#374151',
  },
  toggleActive: {
    backgroundColor: '#667eea',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  backgrounds: {
    flexDirection: 'row',
  },
  backgroundContainer: {
    marginRight: 12,
  },
  backgroundOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedBackground: {
    borderColor: '#667eea',
  },
  contentPreview: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentInput: {
    flex: 1,
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
    width: '100%',
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