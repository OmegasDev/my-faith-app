import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Heart, MessageCircle, UserPlus, Users, Check, X } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { formatTimeAgo } from '../../utils/xpCalculator';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'prayer' | 'circle_invite' | 'message' | 'follow';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionData?: any;
  fromUser?: {
    name: string;
    username: string;
    avatar_url: string | null;
  };
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  useEffect(() => {
    // Mock notifications for now
    setNotifications([
      {
        id: '1',
        type: 'circle_invite',
        title: 'Circle Invitation',
        message: 'Grace Walker invited you to join "Prayer Warriors" circle',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isRead: false,
        fromUser: {
          name: 'Grace Walker',
          username: 'gracewalker',
          avatar_url: null,
        },
        actionData: { circleId: '123', circleName: 'Prayer Warriors' }
      },
      {
        id: '2',
        type: 'prayer',
        title: 'Prayer Response',
        message: 'David prayed for your prayer request',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        fromUser: {
          name: 'David Johnson',
          username: 'davidj',
          avatar_url: null,
        }
      },
      {
        id: '3',
        type: 'like',
        title: 'Post Liked',
        message: 'Sarah liked your testimony post',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        fromUser: {
          name: 'Sarah Miller',
          username: 'sarahm',
          avatar_url: null,
        }
      },
      {
        id: '4',
        type: 'comment',
        title: 'New Comment',
        message: 'John commented on your guidance request',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        fromUser: {
          name: 'John Smith',
          username: 'johnsmith',
          avatar_url: null,
        }
      },
    ]);
    setLoading(false);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart size={20} color="#EF4444" fill="#EF4444" />;
      case 'comment':
        return <MessageCircle size={20} color="#3B82F6" />;
      case 'prayer':
        return <Text style={styles.prayerEmoji}>🙏</Text>;
      case 'circle_invite':
        return <Users size={20} color="#8B5CF6" />;
      case 'message':
        return <MessageCircle size={20} color="#10B981" />;
      case 'follow':
        return <UserPlus size={20} color="#F59E0B" />;
      default:
        return <Bell size={20} color="#6B7280" />;
    }
  };

  const handleAcceptInvite = (notificationId: string, circleId: string) => {
    // Handle circle invite acceptance
    console.log('Accepting invite for circle:', circleId);
    markAsRead(notificationId);
  };

  const handleDeclineInvite = (notificationId: string) => {
    // Handle circle invite decline
    console.log('Declining invite');
    markAsRead(notificationId);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        isDark ? styles.darkCard : styles.lightCard,
        !item.isRead && styles.unreadCard
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationLeft}>
          <View style={styles.avatarContainer}>
            {item.fromUser?.avatar_url ? (
              <Image source={{ uri: item.fromUser.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, isDark ? styles.darkAvatar : styles.lightAvatar]}>
                <Text style={[styles.avatarText, isDark ? styles.darkText : styles.lightText]}>
                  {item.fromUser?.name.charAt(0) || 'N'}
                </Text>
              </View>
            )}
            <View style={styles.iconBadge}>
              {getNotificationIcon(item.type)}
            </View>
          </View>

          <View style={styles.notificationText}>
            <Text style={[styles.notificationTitle, isDark ? styles.darkText : styles.lightText]}>
              {item.title}
            </Text>
            <Text style={[styles.notificationMessage, isDark ? styles.darkSubtext : styles.lightSubtext]}>
              {item.message}
            </Text>
            <Text style={[styles.notificationTime, isDark ? styles.darkSubtext : styles.lightSubtext]}>
              {formatTimeAgo(item.timestamp)}
            </Text>
          </View>
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}
      </View>

      {/* Action buttons for circle invites */}
      {item.type === 'circle_invite' && !item.isRead && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => handleDeclineInvite(item.id)}
          >
            <X size={16} color="#EF4444" />
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAcceptInvite(item.id, item.actionData?.circleId)}
          >
            <Check size={16} color="#FFFFFF" />
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
      <View style={[styles.header, isDark ? styles.darkHeader : styles.lightHeader]}>
        <Image 
          source={require('../../assets/images/Leonardo_Phoenix_10_Create_a_captivating_brand_logo_for_a_soci_3.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.headerTitle, isDark ? styles.darkText : { color: '#1877F2' }]}>
          Notifications
        </Text>
        {unreadCount > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={() => {}}
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
    position: 'relative',
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
  headerBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  notificationCard: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  lightCard: {
    backgroundColor: '#FFFFFF',
  },
  darkCard: {
    backgroundColor: '#1F2937',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightAvatar: {
    backgroundColor: '#F3F4F6',
  },
  darkAvatar: {
    backgroundColor: '#374151',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
  },
  prayerEmoji: {
    fontSize: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 6,
  },
  declineText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#667eea',
    gap: 6,
  },
  acceptText: {
    color: '#FFFFFF',
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