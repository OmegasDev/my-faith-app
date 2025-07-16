export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  avatar?: string;
  joinDate: string;
  stats: {
    postsCount: number;
    prayersGiven: number;
    helpfulGuidance: number;
    dailyStreak: number;
  };
  canCreateCircle: boolean;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  postType: PostType;
  isAnonymous: boolean;
  background: PostBackground;
  timestamp: string;
  reactions: PostReactions;
  comments?: Comment[];
  isOwnPost?: boolean;
}

export type PostType = 'confession' | 'prayer' | 'guidance' | 'testimony' | 'normal';

export interface PostBackground {
  type: 'color' | 'gradient';
  value: string;
  colors?: string[];
}

export interface PostReactions {
  likes: number;
  prayers: number;
  guides: number;
  shares: number;
  userReactions: {
    liked: boolean;
    prayed: boolean;
    guided: boolean;
    shared: boolean;
  };
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
}

export interface FaithCircle {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  createdBy: string;
}