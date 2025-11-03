import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserStats {
  streak: number;
  minutesToday: number;
  accuracy: number;
  tokensEarned: number;
  totalStars: number;
  completedLevels: number;
  loading: boolean;
}

interface ChapterStats {
  [chapter: string]: {
    totalGames: number;
    completedGames: number;
    totalStars: number;
  };
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    streak: 0,
    minutesToday: 0,
    accuracy: 0,
    tokensEarned: 0,
    totalStars: 0,
    completedLevels: 0,
    loading: true,
  });
  const [chapterStats, setChapterStats] = useState<ChapterStats>({});

  useEffect(() => {
    if (!user) {
      setStats({ 
        streak: 0, 
        minutesToday: 0, 
        accuracy: 0, 
        tokensEarned: 0,
        totalStars: 0,
        completedLevels: 0,
        loading: false 
      });
      setChapterStats({});
      return;
    }

    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-user-stats');

        if (error) throw error;

        const todayMinutes = Math.round(
          (data.todaySessions?.reduce((acc: number, s: any) => acc + (s.duration_seconds || 0), 0) || 0) / 60
        );

        const allPerformance = data.performance || [];
        const avgAccuracy = allPerformance.length > 0
          ? Math.round(
              allPerformance.reduce((acc: number, p: any) => acc + (p.ema_accuracy || 0), 0) / allPerformance.length * 100
            )
          : 0;

        const totalTokens = allPerformance.reduce((acc: number, p: any) => acc + (p.tokens || 0), 0);
        const maxStreak = Math.max(...allPerformance.map((p: any) => p.streak_days || 0), 0);

        setStats({
          streak: data.stats?.streak || 0,
          minutesToday: data.stats?.minutesToday || 0,
          accuracy: data.stats?.accuracyToday || 0,
          tokensEarned: data.stats?.totalTokens || 0,
          totalStars: data.stats?.totalStars || 0,
          completedLevels: data.stats?.completedLevels || 0,
          loading: false,
        });

        setChapterStats(data.chapterStats || {});
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
        setStats({ 
          streak: 0, 
          minutesToday: 0, 
          accuracy: 0, 
          tokensEarned: 0,
          totalStars: 0,
          completedLevels: 0,
          loading: false 
        });
        setChapterStats({});
      }
    };

    fetchStats();
  }, [user]);

  return { stats, chapterStats };
};
