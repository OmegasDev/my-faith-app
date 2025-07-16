import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Sun, LogOut } from 'lucide-react-native';
import UserProfileCard from '../../components/UserProfileCard';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  const handleCreateCircle = () => {
    Alert.alert(
      'Create Faith Circle',
      'Faith Circles allow you to create private spiritual communities. Would you like to create one?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create', onPress: () => Alert.alert('Success', 'Faith Circle created successfully!') }
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut }
      ]
    );
  };

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
        <Text style={[styles.loadingText, isDark ? styles.darkText : styles.lightText]}>
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
      <View style={[styles.header, isDark ? styles.darkHeader : styles.lightHeader]}>
        <Image 
          source={require('../../assets/images/Leonardo_Phoenix_10_Create_a_captivating_brand_logo_for_a_soci_3.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.headerTitle, isDark ? styles.darkText : { color: '#1877F2' }]}>
          Profile
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.themeButton, isDark ? styles.darkThemeButton : styles.lightThemeButton]}
            onPress={toggleTheme}
          >
            {isDark ? (
              <Sun size={20} color="#F59E0B" />
            ) : (
              <Moon size={20} color="#6366F1" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <UserProfileCard user={profile} onCreateCircle={handleCreateCircle} />
        
        <View style={[styles.infoCard, isDark ? styles.darkCard : styles.lightCard]}>
          <Text style={[styles.infoTitle, isDark ? styles.darkText : styles.lightText]}>
            About My Faith
          </Text>
          <Text style={[styles.infoText, isDark ? styles.darkSubtext : styles.lightSubtext]}>
            My Faith is a Christian social media platform designed to help believers grow spiritually, 
            share their journey, and build meaningful faith communities. 
          </Text>
          <Text style={[styles.infoText, isDark ? styles.darkSubtext : styles.lightSubtext]}>
            Earn XP by engaging with the community, helping others, and sharing your faith. 
            Unlock Faith Circles to create private spiritual communities when you've shown 
            consistent helpfulness and engagement.
          </Text>
        </View>
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
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  lightThemeButton: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  darkThemeButton: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    borderRadius: 16,
    margin: 16,
    padding: 20,
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
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
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