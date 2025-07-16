import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Heart, HandHeart, Lightbulb, Calendar, Lock } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getXpForNextLevel, getXpProgressPercentage, canCreateFaithCircle } from '../utils/xpCalculator';

interface User {
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
}

interface UserProfileCardProps {
  user: User;
  onCreateCircle?: () => void;
}

export default function UserProfileCard({ user, onCreateCircle }: UserProfileCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const xpForNextLevel = getXpForNextLevel(user.xp);
  const progressPercentage = getXpProgressPercentage(user.xp);
  const canCreateCircle = user.can_create_circle;

  return (
    <View style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
      <LinearGradient
        colors={isDark ? ['#6366F1', '#8B5CF6'] : ['#4338CA', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Award size={16} color="#FFFFFF" />
            <Text style={styles.levelText}>Level {user.level}</Text>
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userUsername}>@{user.username}</Text>
          <Text style={styles.joinDate}>
            <Calendar size={14} color="#E0E7FF" /> Joined {new Date(user.join_date).toLocaleDateString()}
          </Text>
        </View>
      </LinearGradient>

      <View style={[styles.xpSection, isDark ? styles.darkSection : styles.lightSection]}>
        <View style={styles.xpHeader}>
          <Text style={[styles.xpTitle, isDark ? styles.darkText : styles.lightText]}>
            Spiritual Growth
          </Text>
          <Text style={[styles.xpText, isDark ? styles.darkSubtext : styles.lightSubtext]}>
            {user.xp} / {xpForNextLevel} XP
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={[styles.progressText, isDark ? styles.darkSubtext : styles.lightSubtext]}>
          {Math.round(progressPercentage)}% to Level {user.level + 1}
        </Text>
      </View>

      <View style={[styles.statsContainer, isDark ? styles.darkSection : styles.lightSection]}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, isDark ? styles.darkStatIcon : styles.lightStatIcon]}>
            <Text style={styles.statIconText}>📝</Text>
          </View>
          <Text style={[styles.statValue, isDark ? styles.darkText : styles.lightText]}>
            {user.posts_count}
          </Text>
          <Text style={[styles.statLabel, isDark ? styles.darkSubtext : styles.lightSubtext]}>
            Posts
          </Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, isDark ? styles.darkStatIcon : styles.lightStatIcon]}>
            <HandHeart size={20} color="#8B5CF6" />
          </View>
          <Text style={[styles.statValue, isDark ? styles.darkText : styles.lightText]}>
            {user.prayers_given}
          </Text>
          <Text style={[styles.statLabel, isDark ? styles.darkSubtext : styles.lightSubtext]}>
            Prayers
          </Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, isDark ? styles.darkStatIcon : styles.lightStatIcon]}>
            <Lightbulb size={20} color="#F59E0B" />
          </View>
          <Text style={[styles.statValue, isDark ? styles.darkText : styles.lightText]}>
            {user.helpful_guidance}
          </Text>
          <Text style={[styles.statLabel, isDark ? styles.darkSubtext : styles.lightSubtext]}>
            Guidance
          </Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, isDark ? styles.darkStatIcon : styles.lightStatIcon]}>
            <Text style={styles.statIconText}>🔥</Text>
          </View>
          <Text style={[styles.statValue, isDark ? styles.darkText : styles.lightText]}>
            {user.daily_streak}
          </Text>
          <Text style={[styles.statLabel, isDark ? styles.darkSubtext : styles.lightSubtext]}>
            Streak
          </Text>
        </View>
      </View>

      <View style={styles.faithCircleSection}>
        <View style={styles.faithCircleHeader}>
          <Text style={[styles.faithCircleTitle, isDark ? styles.darkText : styles.lightText]}>
            Faith Circles
          </Text>
          {canCreateCircle ? (
            <TouchableOpacity style={styles.createCircleButton} onPress={onCreateCircle}>
              <Text style={styles.createCircleText}>Create Circle</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.lockedCircle, isDark ? styles.darkLockedCircle : styles.lightLockedCircle]}>
              <Lock size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text style={[styles.lockedText, isDark ? styles.darkSubtext : styles.lightSubtext]}>
                Locked
              </Text>
            </View>
          )}
        </View>
        
        {!canCreateCircle && (
          <View style={[styles.unlockRequirements, isDark ? styles.darkUnlockRequirements : styles.lightUnlockRequirements]}>
            <Text style={[styles.unlockTitle, isDark ? styles.darkErrorText : styles.lightErrorText]}>
              Unlock Faith Circles by:
            </Text>
            <Text style={[styles.unlockItem, isDark ? styles.darkErrorSubtext : styles.lightErrorSubtext]}>
              • Reach 1000 XP ({user.xp}/1000)
            </Text>
            <Text style={[styles.unlockItem, isDark ? styles.darkErrorSubtext : styles.lightErrorSubtext]}>
              • Give 50 prayers ({user.prayers_given}/50)
            </Text>
            <Text style={[styles.unlockItem, isDark ? styles.darkErrorSubtext : styles.lightErrorSubtext]}>
              • Provide 10 helpful guidance ({user.helpful_guidance}/10)
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    margin: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  lightContainer: {
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#1F2937',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#4338CA',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 16,
    color: '#E0E7FF',
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 14,
    color: '#E0E7FF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpSection: {
    padding: 20,
    borderBottomWidth: 1,
  },
  lightSection: {
    borderBottomColor: '#E5E7EB',
  },
  darkSection: {
    borderBottomColor: '#374151',
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  xpTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4338CA',
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  lightStatIcon: {
    backgroundColor: '#F3F4F6',
  },
  darkStatIcon: {
    backgroundColor: '#374151',
  },
  statIconText: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  faithCircleSection: {
    padding: 20,
  },
  faithCircleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  faithCircleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  createCircleButton: {
    backgroundColor: '#4338CA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createCircleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  lockedCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  lightLockedCircle: {
    backgroundColor: '#F3F4F6',
  },
  darkLockedCircle: {
    backgroundColor: '#374151',
  },
  lockedText: {
    fontSize: 12,
    marginLeft: 4,
  },
  unlockRequirements: {
    padding: 16,
    borderRadius: 12,
  },
  lightUnlockRequirements: {
    backgroundColor: '#FEF3F2',
  },
  darkUnlockRequirements: {
    backgroundColor: '#7F1D1D',
  },
  unlockTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  unlockItem: {
    fontSize: 12,
    marginBottom: 4,
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
  darkErrorText: {
    color: '#FCA5A5',
  },
  lightErrorText: {
    color: '#DC2626',
  },
  darkErrorSubtext: {
    color: '#FCA5A5',
  },
  lightErrorSubtext: {
    color: '#7F1D1D',
  },
});