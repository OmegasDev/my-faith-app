import { User, Post, PostType, PostBackground } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Grace Walker',
    username: 'GraceWalker',
    email: 'grace@example.com',
    xp: 1250,
    level: 3,
    joinDate: '2024-01-15',
    stats: {
      postsCount: 24,
      prayersGiven: 89,
      helpfulGuidance: 15,
      dailyStreak: 7
    },
    canCreateCircle: true
  },
  {
    id: '2',
    name: 'Truth Seeker',
    username: 'TruthSeeker',
    email: 'truth@example.com',
    xp: 850,
    level: 2,
    joinDate: '2024-02-20',
    stats: {
      postsCount: 18,
      prayersGiven: 45,
      helpfulGuidance: 8,
      dailyStreak: 3
    },
    canCreateCircle: false
  },
  {
    id: '3',
    name: 'Anonymous User',
    username: 'Anonymous',
    email: 'anon@example.com',
    xp: 320,
    level: 1,
    joinDate: '2024-03-10',
    stats: {
      postsCount: 5,
      prayersGiven: 12,
      helpfulGuidance: 2,
      dailyStreak: 1
    },
    canCreateCircle: false
  }
];

const postBackgrounds: PostBackground[] = [
  { type: 'color', value: '#E8F4FD' },
  { type: 'color', value: '#FFF7ED' },
  { type: 'color', value: '#F0FDF4' },
  { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', colors: ['#667eea', '#764ba2'] },
  { type: 'gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', colors: ['#f093fb', '#f5576c'] },
  { type: 'gradient', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', colors: ['#4facfe', '#00f2fe'] },
];

export const mockPosts: Post[] = [
  {
    id: '1',
    userId: '3',
    content: 'I\'ve been struggling with anger lately. Please pray for me to find peace and patience in difficult situations.',
    postType: 'confession',
    isAnonymous: true,
    background: postBackgrounds[0],
    timestamp: '2024-01-15T10:30:00Z',
    reactions: {
      likes: 0,
      prayers: 23,
      guides: 5,
      shares: 0,
      userReactions: {
        liked: false,
        prayed: false,
        guided: false,
        shared: false
      }
    }
  },
  {
    id: '2',
    userId: '1',
    content: 'Please join me in praying for my grandmother who is going through surgery tomorrow. She needs strength and healing.',
    postType: 'prayer',
    isAnonymous: false,
    background: postBackgrounds[1],
    timestamp: '2024-01-15T09:15:00Z',
    reactions: {
      likes: 12,
      prayers: 45,
      guides: 0,
      shares: 8,
      userReactions: {
        liked: true,
        prayed: true,
        guided: false,
        shared: false
      }
    }
  },
  {
    id: '3',
    userId: '2',
    content: 'How do you maintain your faith during seasons of doubt? I feel distant from God and need biblical guidance.',
    postType: 'guidance',
    isAnonymous: false,
    background: postBackgrounds[2],
    timestamp: '2024-01-15T08:45:00Z',
    reactions: {
      likes: 8,
      prayers: 15,
      guides: 18,
      shares: 4,
      userReactions: {
        liked: false,
        prayed: false,
        guided: true,
        shared: false
      }
    }
  },
  {
    id: '4',
    userId: '1',
    content: 'God answered my prayers in the most unexpected way! Lost my job last month but found a better one this week. His timing is perfect! 🙏',
    postType: 'testimony',
    isAnonymous: false,
    background: postBackgrounds[3],
    timestamp: '2024-01-15T07:20:00Z',
    reactions: {
      likes: 34,
      prayers: 12,
      guides: 0,
      shares: 16,
      userReactions: {
        liked: false,
        prayed: false,
        guided: false,
        shared: false
      }
    }
  },
  {
    id: '5',
    userId: '2',
    content: 'Starting a new Bible study group at our church. "Faith in Action" - focusing on living out our beliefs daily. Anyone interested?',
    postType: 'normal',
    isAnonymous: false,
    background: postBackgrounds[4],
    timestamp: '2024-01-15T06:00:00Z',
    reactions: {
      likes: 19,
      prayers: 5,
      guides: 0,
      shares: 7,
      userReactions: {
        liked: false,
        prayed: false,
        guided: false,
        shared: false
      }
    }
  },
  {
    id: '6',
    userId: '3',
    content: 'I feel like I\'m not good enough for God\'s love. The weight of my past mistakes is crushing me.',
    postType: 'confession',
    isAnonymous: true,
    background: postBackgrounds[5],
    timestamp: '2024-01-14T22:30:00Z',
    reactions: {
      likes: 0,
      prayers: 38,
      guides: 12,
      shares: 0,
      userReactions: {
        liked: false,
        prayed: false,
        guided: false,
        shared: false
      }
    }
  },
  {
    id: '7',
    userId: '1',
    content: 'My friend is going through a difficult divorce. Please pray for healing, wisdom, and peace for both families involved.',
    postType: 'prayer',
    isAnonymous: false,
    background: postBackgrounds[0],
    timestamp: '2024-01-14T20:15:00Z',
    reactions: {
      likes: 7,
      prayers: 28,
      guides: 0,
      shares: 3,
      userReactions: {
        liked: false,
        prayed: false,
        guided: false,
        shared: false
      }
    }
  },
  {
    id: '8',
    userId: '2',
    content: 'After years of infertility, we finally welcomed our miracle baby! God\'s plans are higher than ours. Never give up hope! 👶✨',
    postType: 'testimony',
    isAnonymous: false,
    background: postBackgrounds[1],
    timestamp: '2024-01-14T18:45:00Z',
    reactions: {
      likes: 67,
      prayers: 25,
      guides: 0,
      shares: 32,
      userReactions: {
        liked: false,
        prayed: false,
        guided: false,
        shared: false
      }
    }
  },
  {
    id: '9',
    userId: '1',
    content: 'How do you handle Christian friends who judge others harshly? I want to love them but also stand for grace.',
    postType: 'guidance',
    isAnonymous: false,
    background: postBackgrounds[2],
    timestamp: '2024-01-14T16:30:00Z',
    reactions: {
      likes: 15,
      prayers: 8,
      guides: 22,
      shares: 6,
      userReactions: {
        liked: false,
        prayed: false,
        guided: false,
        shared: false
      }
    }
  },
  {
    id: '10',
    userId: '2',
    content: 'Beautiful sunset today reminded me of God\'s daily faithfulness. "His mercies are new every morning" - Lamentations 3:23',
    postType: 'normal',
    isAnonymous: false,
    background: postBackgrounds[3],
    timestamp: '2024-01-14T15:00:00Z',
    reactions: {
      likes: 42,
      prayers: 8,
      guides: 0,
      shares: 15,
      userReactions: {
        liked: false,
        prayed: false,
        guided: false,
        shared: false
      }
    }
  }
];

export const getCurrentUser = (): User => mockUsers[0];

export const getPostTypeColor = (type: PostType): string => {
  switch (type) {
    case 'confession': return '#EF4444';
    case 'prayer': return '#8B5CF6';
    case 'guidance': return '#F59E0B';
    case 'testimony': return '#10B981';
    case 'normal': return '#3B82F6';
    default: return '#6B7280';
  }
};

export const getPostTypeLabel = (type: PostType): string => {
  switch (type) {
    case 'confession': return 'Confession';
    case 'prayer': return 'Prayer Request';
    case 'guidance': return 'Guidance Request';
    case 'testimony': return 'Testimony';
    case 'normal': return 'Post';
    default: return 'Post';
  }
};