import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, FlatList } from 'react-native';
import { Users, Plus, MessageCircle, UserPlus, Send, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface FaithCircle {
  id: string;
  name: string;
  description: string;
  member_count: number;
  is_private: boolean;
  created_by: string;
  is_default: boolean;
}

interface CircleMember {
  id: string;
  user_id: string;
  role: string;
  profiles: {
    name: string;
    username: string;
    avatar_url: string;
  };
}

interface CircleMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
    username: string;
  };
}

export default function CirclesScreen() {
  const { user, profile } = useAuth();
  const [circles, setCircles] = useState<FaithCircle[]>([]);
  const [joinedCircles, setJoinedCircles] = useState<string[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<FaithCircle | null>(null);
  const [circleMembers, setCircleMembers] = useState<CircleMember[]>([]);
  const [circleMessages, setCircleMessages] = useState<CircleMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDescription, setNewCircleDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCircles();
    fetchJoinedCircles();
  }, []);

  const fetchCircles = async () => {
    try {
      const { data, error } = await supabase
        .from('faith_circles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCircles(data || []);
    } catch (error) {
      console.error('Error fetching circles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinedCircles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('circle_members')
        .select('circle_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setJoinedCircles(data?.map(item => item.circle_id) || []);
    } catch (error) {
      console.error('Error fetching joined circles:', error);
    }
  };

  const fetchCircleMembers = async (circleId: string) => {
    try {
      const { data, error } = await supabase
        .from('circle_members')
        .select(`
          id,
          user_id,
          role,
          profiles (
            name,
            username,
            avatar_url
          )
        `)
        .eq('circle_id', circleId);

      if (error) throw error;
      setCircleMembers(
        (data || []).map(member => ({
          ...member,
          profiles: Array.isArray(member.profiles) ? member.profiles[0] : member.profiles,
        }))
      );
    } catch (error) {
      console.error('Error fetching circle members:', error);
    }
  };

  const fetchCircleMessages = async (circleId: string) => {
    try {
      const { data, error } = await supabase
        .from('circle_messages')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            name,
            username
          )
        `)
        .eq('circle_id', circleId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCircleMessages(
        (data || []).map(message => ({
          ...message,
          profiles: Array.isArray(message.profiles) ? message.profiles[0] : message.profiles,
        }))
      );
    } catch (error) {
      console.error('Error fetching circle messages:', error);
    }
  };

  const joinCircle = async (circleId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('circle_members')
        .insert({
          circle_id: circleId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;
      
      setJoinedCircles(prev => [...prev, circleId]);
      Alert.alert('Success', 'You have joined the circle!');
    } catch (error) {
      console.error('Error joining circle:', error);
      Alert.alert('Error', 'Failed to join circle');
    }
  };

  const leaveCircle = async (circleId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('circle_members')
        .delete()
        .eq('circle_id', circleId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setJoinedCircles(prev => prev.filter(id => id !== circleId));
      Alert.alert('Success', 'You have left the circle');
    } catch (error) {
      console.error('Error leaving circle:', error);
      Alert.alert('Error', 'Failed to leave circle');
    }
  };

  const createCircle = async () => {
    if (!user || !profile?.can_create_circle) {
      Alert.alert('Permission Denied', 'You need to reach a higher level to create circles');
      return;
    }

    if (!newCircleName.trim()) {
      Alert.alert('Error', 'Please enter a circle name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('faith_circles')
        .insert({
          name: newCircleName,
          description: newCircleDescription,
          created_by: user.id,
          is_private: false
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join the creator
      await supabase
        .from('circle_members')
        .insert({
          circle_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      setCircles(prev => [data, ...prev]);
      setJoinedCircles(prev => [...prev, data.id]);
      setShowCreateModal(false);
      setNewCircleName('');
      setNewCircleDescription('');
      Alert.alert('Success', 'Circle created successfully!');
    } catch (error) {
      console.error('Error creating circle:', error);
      Alert.alert('Error', 'Failed to create circle');
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedCircle || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('circle_messages')
        .insert({
          circle_id: selectedCircle.id,
          user_id: user.id,
          content: newMessage,
          message_type: 'text'
        });

      if (error) throw error;
      
      setNewMessage('');
      fetchCircleMessages(selectedCircle.id);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const openCircleChat = (circle: FaithCircle) => {
    setSelectedCircle(circle);
    fetchCircleMessages(circle.id);
    setShowChatModal(true);
  };

  const openMembersModal = (circle: FaithCircle) => {
    setSelectedCircle(circle);
    fetchCircleMembers(circle.id);
    setShowMembersModal(true);
  };

  const renderCircleItem = ({ item }: { item: FaithCircle }) => {
    const isJoined = joinedCircles.includes(item.id);
    
    return (
      <View style={styles.circleCard}>
        <View style={styles.circleHeader}>
          <View style={styles.circleIcon}>
            <Users size={24} color="#6366f1" />
          </View>
          <View style={styles.circleInfo}>
            <Text style={styles.circleName}>{item.name}</Text>
            <Text style={styles.circleDescription}>{item.description}</Text>
            <Text style={styles.memberCount}>{item.member_count} members</Text>
          </View>
        </View>
        
        <View style={styles.circleActions}>
          {isJoined ? (
            <>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => openCircleChat(item)}
              >
                <MessageCircle size={16} color="#fff" />
                <Text style={styles.chatButtonText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.membersButton}
                onPress={() => openMembersModal(item)}
              >
                <UserPlus size={16} color="#6366f1" />
                <Text style={styles.membersButtonText}>Members</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={() => leaveCircle(item.id)}
              >
                <Text style={styles.leaveButtonText}>Leave</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => joinCircle(item.id)}
            >
              <Text style={styles.joinButtonText}>Join Circle</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderMessage = ({ item }: { item: CircleMessage }) => (
    <View style={styles.messageItem}>
      <Text style={styles.messageSender}>{item.profiles.name}</Text>
      <Text style={styles.messageContent}>{item.content}</Text>
      <Text style={styles.messageTime}>
        {new Date(item.created_at).toLocaleTimeString()}
      </Text>
    </View>
  );

  const renderMember = ({ item }: { item: CircleMember }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.profiles.name}</Text>
        <Text style={styles.memberUsername}>@{item.profiles.username}</Text>
      </View>
      <Text style={styles.memberRole}>{item.role}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading circles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Faith Circles</Text>
        {profile?.can_create_circle && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={circles}
        renderItem={renderCircleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.circlesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Create Circle Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Circle</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Circle Name"
              value={newCircleName}
              onChangeText={setNewCircleName}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newCircleDescription}
              onChangeText={setNewCircleDescription}
              multiline
              numberOfLines={3}
            />
            
            <TouchableOpacity style={styles.createCircleButton} onPress={createCircle}>
              <Text style={styles.createCircleButtonText}>Create Circle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Circle Chat Modal */}
      <Modal visible={showChatModal} animationType="slide">
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>{selectedCircle?.name}</Text>
            <TouchableOpacity onPress={() => setShowChatModal(false)}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={circleMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            ListEmptyComponent={
              <View style={styles.emptyMessages}>
                <Text style={styles.emptyText}>No messages yet.</Text>
                <Text style={styles.emptySubtext}>Start the conversation!</Text>
              </View>
            }
          />
          
          <View style={styles.messageInput}>
            <TextInput
              style={styles.messageTextInput}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Send size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Members Modal */}
      <Modal visible={showMembersModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Circle Members</Text>
              <TouchableOpacity onPress={() => setShowMembersModal(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={circleMembers}
              renderItem={renderMember}
              keyExtractor={(item) => item.id}
              style={styles.membersList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  createButton: {
    backgroundColor: '#6366f1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circlesList: {
    padding: 20,
  },
  circleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  circleHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  circleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  circleInfo: {
    flex: 1,
  },
  circleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  circleDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  circleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  joinButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  chatButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chatButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  membersButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  membersButtonText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  leaveButtonText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  createCircleButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createCircleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  messageInput: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'flex-end',
  },
  messageTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#6366f1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  membersList: {
    maxHeight: 400,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  memberUsername: {
    fontSize: 14,
    color: '#64748b',
  },
  memberRole: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});