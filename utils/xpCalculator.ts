import { User } from '../types';

export const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 500) + 1;
};

export const getXpForNextLevel = (currentXp: number): number => {
  const currentLevel = calculateLevel(currentXp);
  return currentLevel * 500;
};

export const getXpProgressPercentage = (currentXp: number): number => {
  const currentLevel = calculateLevel(currentXp);
  const xpForCurrentLevel = (currentLevel - 1) * 500;
  const xpForNextLevel = currentLevel * 500;
  const progressXp = currentXp - xpForCurrentLevel;
  const totalXpNeeded = xpForNextLevel - xpForCurrentLevel;
  
  return (progressXp / totalXpNeeded) * 100;
};

export const canCreateFaithCircle = (user: User): boolean => {
  return user.xp >= 1000 && user.stats.prayersGiven >= 50 && user.stats.helpfulGuidance >= 10;
};

export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}w ago`;
};