import { useState, useEffect, useCallback } from 'react';
import { achievementAPI } from '../services/api';

/**
 * Custom hook for managing achievements
 * Provides achievement data, stats, and functions for checking new achievements
 */
export const useAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    totalAchievements: 0,
    unlockedCount: 0,
    totalPoints: 0,
    completionPercentage: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  // Load all achievements with progress
  const loadAchievements = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏆 Loading achievements from backend...');
      const response = await achievementAPI.getAllAchievements();
      
      if (response.success && response.data) {
        setAchievements(response.data.achievements || []);
        setStats(response.data.stats || {});
        console.log('✅ Achievements loaded from backend:', response.data.achievements?.length || 0, 'achievements');
      } else {
        throw new Error('Invalid response from achievements API');
      }
    } catch (err) {
      console.error('❌ Failed to load achievements:', err);
      setError(err.message || 'Failed to load achievements');
      
      // Fallback to empty state
      setAchievements([]);
      setStats({
        totalAchievements: 0,
        unlockedCount: 0,
        totalPoints: 0,
        completionPercentage: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for new achievements
  const checkNewAchievements = useCallback(async () => {
    try {
      console.log('🔍 Checking for new achievements...');
      
      const response = await achievementAPI.checkAchievements();
      
      if (response.success && response.data) {
        const { newAchievements: newUnlocked, message } = response.data;
        
        if (newUnlocked && newUnlocked.length > 0) {
          console.log('🎉 New achievements unlocked:', newUnlocked.length);
          setNewAchievements(newUnlocked);
          setShowNotification(true);
          
          // Refresh achievements to show updated status
          await loadAchievements();
        }
        
        return { newAchievements: newUnlocked || [], message: message || 'No new achievements' };
      } else {
        throw new Error('Invalid response from achievement check API');
      }
    } catch (err) {
      console.error('❌ Failed to check achievements:', err);
      return { newAchievements: [], message: 'Failed to check achievements' };
    }
  }, [loadAchievements]);

  // Get achievement leaderboard
  const getLeaderboard = useCallback(async (limit = 10) => {
    try {
      console.log('🏅 Loading achievement leaderboard...');
      
      const response = await achievementAPI.getLeaderboard(limit);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response from leaderboard API');
      }
    } catch (err) {
      console.error('❌ Failed to load leaderboard:', err);
      return { leaderboard: [], totalUsers: 0 };
    }
  }, []);

  // Dismiss achievement notification
  const dismissNotification = useCallback(() => {
    setShowNotification(false);
    setNewAchievements([]);
  }, []);

  // Load achievements on mount
  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  // Helper functions for UI
  const getUnlockedAchievements = useCallback(() => {
    return achievements.filter(achievement => achievement.unlocked);
  }, [achievements]);

  const getLockedAchievements = useCallback(() => {
    return achievements.filter(achievement => !achievement.unlocked);
  }, [achievements]);

  const getAchievementsByCategory = useCallback((category) => {
    return achievements.filter(achievement => achievement.category === category);
  }, [achievements]);

  return {
    // Data
    achievements,
    stats,
    newAchievements,
    showNotification,
    
    // State
    loading,
    error,
    
    // Functions
    loadAchievements,
    checkNewAchievements,
    getLeaderboard,
    dismissNotification,
    
    // Helper functions
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementsByCategory
  };
};

export default useAchievements;
