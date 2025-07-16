import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import CreatePostModal from '../../components/CreatePostModal';
import { useTheme } from '../../contexts/ThemeContext';

export default function CreateScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  const handleCreatePost = () => {
    // Modal handles the actual post creation
    console.log('Post created successfully');
  };

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#1F2937" : "#667eea"} />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Image 
          source={require('../../assets/images/Leonardo_Phoenix_10_Create_a_captivating_brand_logo_for_a_soci_3.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Create Post</Text>
        <Text style={styles.headerSubtitle}>Share your faith journey</Text>
      </LinearGradient>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.createButtonGradient}
          >
            <Plus size={24} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create New Post</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={[styles.welcomeCard, isDark ? styles.darkCard : styles.lightCard]}>
          <LinearGradient
            colors={isDark ? ['#374151', '#4B5563'] : ['#F3F4F6', '#E5E7EB']}
            style={styles.iconContainer}
          >
            <Plus size={32} color={isDark ? '#818CF8' : '#4338CA'} />
          </LinearGradient>
          
          <Text style={[styles.welcomeTitle, isDark ? styles.darkText : styles.lightText]}>
            Share Your Heart
          </Text>
          <Text style={[styles.welcomeDescription, isDark ? styles.darkSubtext : styles.lightSubtext]}>
            Whether it's a prayer request, testimony, confession, or guidance needed - 
            your faith community is here to support you.
          </Text>
          
          <View style={styles.postTypes}>
            <View style={styles.postTypeItem}>
              <Text style={styles.postTypeEmoji}>🙏</Text>
              <Text style={[styles.postTypeLabel, isDark ? styles.darkSubtext : styles.lightSubtext]}>
                Prayer Request
              </Text>
            </View>
            <View style={styles.postTypeItem}>
              <Text style={styles.postTypeEmoji}>✨</Text>
              <Text style={[styles.postTypeLabel, isDark ? styles.darkSubtext : styles.lightSubtext]}>
                Testimony
              </Text>
            </View>
            <View style={styles.postTypeItem}>
              <Text style={styles.postTypeEmoji}>💭</Text>
              <Text style={[styles.postTypeLabel, isDark ? styles.darkSubtext : styles.lightSubtext]}>
                Confession
              </Text>
            </View>
            <View style={styles.postTypeItem}>
              <Text style={styles.postTypeEmoji}>🔍</Text>
              <Text style={[styles.postTypeLabel, isDark ? styles.darkSubtext : styles.lightSubtext]}>
                Guidance
              </Text>
            </View>
          </View>
        </View>
      </View>

      <CreatePostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={() => {
          handleCreatePost();
          setModalVisible(false);
        }}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  createButton: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lightCard: {
    backgroundColor: '#FFFFFF',
  },
  darkCard: {
    backgroundColor: '#1F2937',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  welcomeDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  postTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  postTypeItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  postTypeEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  postTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
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