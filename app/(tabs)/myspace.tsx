import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Sparkles, MessageCircle, Heart } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function MySpaceScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
      <View style={[styles.header, isDark ? styles.darkHeader : styles.lightHeader]}>
        <Image 
          source={require('../../assets/images/Leonardo_Phoenix_10_Create_a_captivating_brand_logo_for_a_soci_3.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.headerTitle, isDark ? styles.darkText : { color: '#1877F2' }]}>
          My Space
        </Text>
      </View>

      <View style={styles.content}>
        <LinearGradient
          colors={isDark ? ['#4C1D95', '#7C3AED'] : ['#6366F1', '#8B5CF6']}
          style={styles.heroSection}
        >
          <View style={styles.iconContainer}>
            <BookOpen size={48} color="#FFFFFF" />
            <Sparkles size={24} color="#F59E0B" style={styles.sparkleIcon} />
          </View>
          
          <Text style={styles.heroTitle}>Your Personal Bible Study Space</Text>
          <Text style={styles.heroSubtitle}>
            AI-powered Bible reading companion for deeper spiritual growth
          </Text>
        </LinearGradient>

        <View style={[styles.featuresCard, isDark ? styles.darkCard : styles.lightCard]}>
          <Text style={[styles.featuresTitle, isDark ? styles.darkText : styles.lightText]}>
            What's Coming:
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <BookOpen size={20} color={isDark ? '#818CF8' : '#6366F1'} />
              <Text style={[styles.featureText, isDark ? styles.darkText : styles.lightText]}>
                Daily Bible reading plans with AI insights
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <MessageCircle size={20} color={isDark ? '#818CF8' : '#6366F1'} />
              <Text style={[styles.featureText, isDark ? styles.darkText : styles.lightText]}>
                Ask questions and get biblical guidance
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Heart size={20} color={isDark ? '#818CF8' : '#6366F1'} />
              <Text style={[styles.featureText, isDark ? styles.darkText : styles.lightText]}>
                Personalized devotionals and prayers
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Sparkles size={20} color={isDark ? '#818CF8' : '#6366F1'} />
              <Text style={[styles.featureText, isDark ? styles.darkText : styles.lightText]}>
                Track your spiritual growth journey
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.comingSoonBanner}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.bannerGradient}
          >
            <Text style={styles.comingSoonText}>
              <Text style={styles.boldText}>COMING SOON</Text>
              {'\n'}
              Stay Tuned! 🙏
            </Text>
          </LinearGradient>
        </View>
      </View>
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
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  heroSection: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  sparkleIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
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
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 24,
  },
  comingSoonBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  bannerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  comingSoonText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
  },
  boldText: {
    fontWeight: '800',
    fontSize: 20,
  },
  darkText: {
    color: '#FFFFFF',
  },
  lightText: {
    color: '#1F2937',
  },
});