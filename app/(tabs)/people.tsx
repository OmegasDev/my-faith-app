import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MessageCircle, UserPlus, Award } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

interface Person {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  posts_count: number;
  prayers_given: number;
}

export default function PeopleScreen() {
  const [people, setPeople] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, level, xp, posts_count, prayers_given')
        .neq('id', user?.id) // Exclude current user
        .order('level', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPeople(data || []);
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMessage = (userId: string) => {
    router.push(`/chat/${userId}`);
  };

  const renderPerson = ({ item }: { item: Person }) => (
    <View style={[styles.personCard, isDark ? styles.darkCard : styles.lightCard]}>
      <View style={styles.personInfo}>
        <View style={styles.avatarContainer}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, isDark ? styles.darkAvatar : styles.lightAvatar]}>
              <Text style={[styles.avatarText, isDark ? styles.darkText : styles.lightText]}>
                {item.name.charAt(0)}
              </Text>
            </View>
          )}
          <View style={styles.levelBadge}>
            <Award size={12} color="#FFFFFF" />
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>

        <View style={styles.userDetails}>
          <Text style={[styles.personName, isDark ? styles.darkText : styles.lightText]}>
            {item.name}
          </Text>
          <Text style={[styles.personUsername, isDark ? styles.darkSubtext : styles.lightSubtext]}>
            @{item.username}
          </Text>
          
          <View style={styles.stats}>
            <Text style={[styles.statText, isDark ? styles.darkSubtext : styles.lightSubtext]}>
              {item.xp} XP • {item.posts_count} posts • {item.prayers_given} prayers
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.messageButton]}
          onPress={() => handleMessage(item.id)}
        >
          <MessageCircle size={16} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.inviteButton]}
        >
          <UserPlus size={16} color="#667eea" />
        </TouchableOpacity>
      </View>
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
          People
        </Text>
      </View>

      <View style={[styles.searchContainer, isDark ? styles.darkSearchContainer : styles.lightSearchContainer]}>
        <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
        <TextInput
          style={[styles.searchInput, isDark ? styles.darkText : styles.lightText]}
          placeholder="Search people..."
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredPeople}
        renderItem={renderPerson}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchPeople}
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
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  personInfo: {
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
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#667eea',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  personUsername: {
    fontSize: 14,
    marginBottom: 4,
  },
  stats: {
    flexDirection: 'row',
  },
  statText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButton: {
    backgroundColor: '#10B981',
  },
  inviteButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#667eea',
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