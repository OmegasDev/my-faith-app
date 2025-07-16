import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Plus, Lock, MessageCircle } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

interface FaithCircle {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  is_private: boolean;
  member_count: number;
  created_by: string | null;
  is_default: boolean;
  is_member?: boolean;
}

export default function CirclesScreen() {
  const [circles, setCircles] = useState<FaithCircle[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  useEffect(() => {
    if (user) {
      fetchCircles();
    }
  }, [user]);

  const fetchCircles = async () => {
    try {
      // Get all circles
      const { data: circlesData, error: circlesError } = await supabase
        .from('faith_circles')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (circlesError) throw circlesError;

      // Get user's memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('circle_members')
        .select('circle_id')
        .eq('user_id', user!.id);

      if (membershipError) throw membershipError;

      const memberCircleIds = new Set(memberships.map(m => m.circle_id));

      const circlesWithMembership = circlesData.map(circle => ({
        ...circle,
        is_member: memberCircleIds.has(circle.id),
      }));

      setCircles(circlesWithMembership);
    } catch (error) {
      console.error('Error fetching circles:', error);
      Alert.alert('Error', 'Failed to load faith circles');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCircle = async (circleId: string) => {
    try {
      const { error } = await supabase
        .from('circle_members')
        .insert({
          circle_id: circleId,
          user_id: user!.id,
        });

      if (error) throw error;

      // Update local state
      setCircles(prev => prev.map(circle => 
        circle.id === circleId 
          ? { ...circle, is_member: true, member_count: circle.member_count + 1 }
          : circle
      ));

      Alert.alert('Success', 'You have joined the faith circle!');
    } catch (error) {
      console.error('Error joining circle:', error);
      Alert.alert('Error', 'Failed to join circle');
    }
  };

  const handleLeaveCircle = async (circleId: string) => {
    Alert.alert(
      'Leave Circle',
      'Are you sure you want to leave this faith circle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('circle_members')
                .delete()
                .eq('circle_id', circleId)
                .eq('user_id', user!.id);

              if (error) throw error;

              setCircles(prev => prev.map(circle => 
                circle.id === circleId 
                  ? { ...circle, is_member: false, member_count: circle.member_count - 1 }
                  : circle
              ));

              Alert.alert('Success', 'You have left the faith circle');
            } catch (error) {
              console.error('Error leaving circle:', error);
              Alert.alert('Error', 'Failed to leave circle');
            }
          },
        },
      ]
    );
  };

  const handleCreateCircle = () => {
    if (!profile?.can_create_circle) {
      Alert.alert(
        'Feature Locked',
        'You need to earn more XP and help others to unlock the ability to create Faith Circles.\n\nRequirements:\n• 1000 XP\n• 50 prayers given\n• 10 helpful guidance',
        [{ text: 'OK' }]
      );
      return;
    }

    // TODO: Navigate to create circle screen
    Alert.alert('Coming Soon', 'Circle creation feature is coming soon!');
  };

  const handleOpenCircle = (circle: FaithCircle) => {
    if (!circle.is_member) {
      Alert.alert('Join Required', 'You need to join this circle to access it');
      return;
    }

    // TODO: Navigate to circle chat
    router.push(`/circle/${circle.id}`);
  };

  const renderCircle = ({ item }: { item: FaithCircle }) => (
    <TouchableOpacity
      style={[styles.circleCard, isDark ? styles.darkCard : styles.lightCard]}
      onPress={() => handleOpenCircle(item)}
    >
      <View style={styles.circleHeader}>
        <View style={styles.circleAvatar}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Users size={24} color={isDark ? '#FFFFFF' : '#667eea'} />
          )}
        </View>
        <View style={styles.circleInfo}>
          <View style={styles.circleNameRow}>
            <Text style={[styles.circleName, isDark ? styles.darkText : styles.lightText]}>
              {item.name}
            </Text>
            {item.is_default && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={[styles.circleDescription, isDark ? styles.darkSubtext : styles.lightSubtext]}>
            {item.description || 'A faith community for spiritual growth'}
          </Text>
          <View style={styles.circleStats}>
            <Text style={[styles.memberCount, isDark ? styles.darkSubtext : styles.lightSubtext]}>
              {item.member_count} members
            </Text>
            {item.is_private && (
              <View style={styles.privateIndicator}>
                <Lock size={12} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.privateText, isDark ? styles.darkSubtext : styles.lightSubtext]}>
                  Private
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.circleActions}>
        {item.is_member ? (
          <View style={styles.memberActions}>
            <TouchableOpacity
              style={[styles.chatButton, isDark ? styles.darkChatButton : styles.lightChatButton]}
              onPress={() => handleOpenCircle(item)}
            >
              <MessageCircle size={16} color={isDark ? '#FFFFFF' : '#667eea'} />
              <Text style={[styles.chatButtonText, isDark ? styles.darkText : { color: '#667eea' }]}>
                Chat
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.leaveButton}
              onPress={() => handleLeaveCircle(item.id)}
            >
              <Text style={styles.leaveButtonText}>Leave</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => handleJoinCircle(item.id)}
          >
            <Text style={styles.joinButtonText}>Join Circle</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
      <View style={[styles.header, isDark ? styles.darkHeader : styles.lightHeader]}>
        <Image 
          source={require('../../assets/images/Leonardo_Phoenix_10_Create_a_captivating_brand_logo_for_a_soci_3.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.headerTitle, isDark ? styles.darkText : { color: '#1877F2' }]}>
          Faith Circles
        </Text>
        <TouchableOpacity
          style={[styles.createButton, !profile?.can_create_circle && styles.disabledButton]}
          onPress={handleCreateCircle}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={circles}
        renderItem={renderCircle}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchCircles}
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
  createButton: {
    backgroundColor: '#667eea',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  listContent: {
    padding: 16,
  },
  circleCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  circleHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  circleAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  circleInfo: {
    flex: 1,
  },
  circleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  circleName: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  circleDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  circleStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 12,
    marginRight: 12,
  },
  privateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privateText: {
    fontSize: 12,
    marginLeft: 4,
  },
  circleActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  lightChatButton: {
    borderColor: '#667eea',
    backgroundColor: 'transparent',
  },
  darkChatButton: {
    borderColor: '#818CF8',
    backgroundColor: 'transparent',
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  leaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EF4444',
  },
  leaveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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