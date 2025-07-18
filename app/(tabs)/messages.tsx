import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MessageCircle, Plus } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { formatTimeAgo } from '../../utils/xpCalculator';
import { router } from 'expo-router';

interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    name: string;
    username: string;
    avatar_url: string | null;
  };
  receiver?: {
    name: string;
    username: string;
    avatar_url: string | null;
  };
}

interface Conversation {
  user_id: string;
  user_name: string;
  user_username: string;
  user_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_sender: boolean;
}

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      // Get all messages involving the current user
      const { data: messages, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender:profiles!sender_id(name, username, avatar_url),
          receiver:profiles!receiver_id(name, username, avatar_url)
        `)
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation partner
      const conversationMap = new Map<string, Conversation>();

      messages.forEach((message: any) => {
        const isCurrentUserSender = message.sender_id === user!.id;
        const partnerId = isCurrentUserSender ? message.receiver_id : message.sender_id;
        const partner = isCurrentUserSender ? message.receiver : message.sender;

        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            user_id: partnerId,
            user_name: partner.name,
            user_username: partner.username,
            user_avatar: partner.avatar_url,
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: 0,
            is_sender: isCurrentUserSender,
          });
        }

        // Count unread messages (messages sent to current user that are unread)
        if (!isCurrentUserSender && !message.is_read) {
          const conv = conversationMap.get(partnerId)!;
          conv.unread_count++;
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user_username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[styles.conversationCard, isDark ? styles.darkCard : styles.lightCard]}
      onPress={() => {
        // TODO: Navigate to chat screen
        console.log('Open chat with:', item.user_name);
      }}
    >
      <View style={styles.avatarContainer}>
        {item.user_avatar ? (
          <Image source={{ uri: item.user_avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, isDark ? styles.darkAvatar : styles.lightAvatar]}>
            <Text style={[styles.avatarText, isDark ? styles.darkText : styles.lightText]}>
              {item.user_name.charAt(0)}
            </Text>
          </View>
        )}
        {item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unread_count > 9 ? '9+' : item.unread_count}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.userName, isDark ? styles.darkText : styles.lightText]}>
            {item.user_name}
          </Text>
          <Text style={[styles.timestamp, isDark ? styles.darkSubtext : styles.lightSubtext]}>
            {formatTimeAgo(item.last_message_time)}
          </Text>
        </View>
        <Text
          style={[
            styles.lastMessage,
            isDark ? styles.darkSubtext : styles.lightSubtext,
            item.unread_count > 0 && styles.unreadMessage,
          ]}
          numberOfLines={1}
        >
          {item.is_sender ? 'You: ' : ''}{item.last_message}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MessageCircle size={64} color={isDark ? '#6B7280' : '#9CA3AF'} />
      <Text style={[styles.emptyTitle, isDark ? styles.darkText : styles.lightText]}>
        No Messages Yet
      </Text>
      <Text style={[styles.emptyDescription, isDark ? styles.darkSubtext : styles.lightSubtext]}>
        Start conversations with other believers in your faith community
      </Text>
      <TouchableOpacity
        style={styles.startConversationButton}
        onPress={() => router.push('/people')}
      >
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.startConversationText}>Start Conversation</Text>
      </TouchableOpacity>
    </View>
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
          Messages
        </Text>
        <TouchableOpacity
          style={styles.newMessageButton}
          onPress={() => router.push('/people')}
        >
          <Plus size={20} color="#667eea" />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, isDark ? styles.darkSearchContainer : styles.lightSearchContainer]}>
        <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
        <TextInput
          style={[styles.searchInput, isDark ? styles.darkText : styles.lightText]}
          placeholder="Search conversations..."
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={[
          styles.listContent,
          filteredConversations.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchConversations}
        ListEmptyComponent={renderEmptyState}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
  },
  lightSearchContainer: {
    backgroundColor: '#FFFFFF',
  },
  darkSearchContainer: {
    backgroundColor: '#1F2937',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  lightCard: {
    backgroundColor: '#FFFFFF',
  },
  darkCard: {
    backgroundColor: '#1F2937',
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
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadMessage: {
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  startConversationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  startConversationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  newMessageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
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